import { Fragment, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDbClient, useLiveQuery } from "@tanstack/react-db";
import { format, formatDistanceStrict } from "date-fns";
import { DownloadIcon, FileSpreadsheetIcon, UploadIcon, XIcon } from "lucide-react";
import Papa from "papaparse";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { importJobs } from "@/db/schema";
import { importJobsCollection } from "@/integrations/tanstack-db/import-jobs";
import { Spinner } from "@/components/ui/spinner";
import { importProgressQuery } from "@/lib/import-progress";
import { uploadCsv } from "@/lib/upload";

export const Route = createFileRoute("/_authenticated/_layout/tools/_layout/import")({
  beforeLoad: ({ context }) => {
    void context.dbClient.collection(importJobsCollection).preload();
  },
  component: ImportPage,
  context: () => ({ getTitle: () => "Import" }),
});

type UploadStatus =
  | { step: "ready" }
  | { step: "uploading"; percent: number }
  | { step: "uploaded"; importId: string }
  | { step: "failed"; message: string };

type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";

type ImportJob = typeof importJobs.$inferSelect;

// How many past imports show before "Show all"
const RECENT_IMPORT_COUNT = 5;

type FileCheck = { tableNames: Array<string>; missingColumns: Array<string> };

// Only the start of the file is read, which is plenty for the header row of even a very large export
async function readHeaderRow(file: File): Promise<Array<string>> {
  const start = await file.slice(0, 64 * 1024).text();
  const firstRow = Papa.parse<Array<string>>(start, { preview: 1 }).data[0] ?? [];
  // Some exports start with a byte order mark, which would otherwise stick to the first column name
  return firstRow.map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, "") : header));
}

// The file name decides which tables an import updates, and the header row has to have the columns they read,
// so both are checked before uploading
async function checkFile(file: File): Promise<FileCheck> {
  const params = new URLSearchParams({ filename: file.name });
  for (const header of await readHeaderRow(file)) params.append("header", header);

  const response = await fetch(`/api/import/match?${params.toString()}`);
  if (!response.ok) throw new Error(`Could not check the file (${response.status})`);
  return (await response.json()) as FileCheck;
}

// Turns a schema key like "studentAcademicInfo" into "Student academic info"
function formatTableName(name: string) {
  const words = name.replace(/([A-Z])/g, " $1").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>({ step: "ready" });

  const isCsv = file?.name.toLowerCase().endsWith(".csv") ?? false;
  const match = useQuery({
    // Size and modified time too, so choosing an edited file with the same name checks it again
    queryKey: ["import-match", file?.name, file?.size, file?.lastModified],
    queryFn: () => (file ? checkFile(file) : null),
    enabled: isCsv,
  });
  const tableNames = isCsv ? (match.data?.tableNames ?? []) : [];
  const missingColumns = isCsv ? (match.data?.missingColumns ?? []) : [];

  // Streams the import's progress once the file is on the server
  const importId = status.step === "uploaded" ? status.importId : "";
  const progress = useQuery(importProgressQuery(importId));
  const importFinished = progress.data?.done === true || progress.isError;

  const dbClient = useDbClient();
  const queryClient = useQueryClient();
  const { data: jobs, isLoading: jobsLoading } = useLiveQuery((q) =>
    q.from({ jobs: importJobsCollection }).orderBy(({ jobs }) => jobs.createdAt, "desc"),
  );
  // Imports run one file at a time, including ones started from another tab or by someone else
  const otherImportRunning = jobs.some(
    (job) => (job.status === "pending" || job.status === "processing") && job.id !== importId,
  );
  const canImport =
    tableNames.length > 0 &&
    missingColumns.length === 0 &&
    !otherImportRunning &&
    (status.step === "ready" || status.step === "failed");

  // Picks up the finished import's final row count and status in the list below, and marks the
  // rest of the data stale so pages show the imported rows instead of waiting out their stale time
  useEffect(() => {
    if (!importFinished) return;
    void dbClient.collection(importJobsCollection).utils.refetch();
    void queryClient.invalidateQueries();
  }, [importFinished, dbClient, queryClient]);

  const chooseFile = (chosen: File | undefined) => {
    if (!chosen) return;
    setFile(chosen);
    setStatus({ step: "ready" });
  };

  const clearFile = () => {
    setFile(null);
    setStatus({ step: "ready" });
  };

  const handleImport = async () => {
    if (!file) return;
    setStatus({ step: "uploading", percent: 0 });
    try {
      const result = await uploadCsv(file, (percent) => setStatus({ step: "uploading", percent }));
      setStatus({ step: "uploaded", importId: result.importId });
      void dbClient.collection(importJobsCollection).utils.refetch();
    } catch (error) {
      setStatus({
        step: "failed",
        message: error instanceof Error ? error.message : "Upload failed",
      });
    }
  };

  // One description per stage, so the attachment always says what's happening to the file
  let attachmentState: AttachmentState = "idle";
  let description = "";
  if (file) {
    const size = formatFileSize(file.size);
    if (status.step === "uploading") {
      attachmentState = "uploading";
      description = `Uploading · ${status.percent}%`;
    } else if (status.step === "uploaded") {
      if (progress.isError) {
        attachmentState = "error";
        description = "Lost track of the import. Check History for how it finished.";
      } else if (progress.data?.done && progress.data.error) {
        attachmentState = "error";
        description = "Import failed · The log has the full error";
      } else if (progress.data?.done) {
        attachmentState = "done";
        description = `${size} · ${progress.data.totalRows.toLocaleString()} rows imported`;
      } else {
        attachmentState = "processing";
        description = `Importing · ${progress.data?.percent ?? 0}%`;
      }
    } else if (status.step === "failed") {
      attachmentState = "error";
      description = status.message;
    } else if (!isCsv) {
      attachmentState = "error";
      description = "Only .csv files can be imported";
    } else if (match.isPending) {
      description = `${size} · Checking file…`;
    } else if (match.isError) {
      attachmentState = "error";
      description = "Couldn't check the file. Try choosing it again.";
    } else if (tableNames.length === 0) {
      attachmentState = "error";
      description = "COBIS doesn't recognize this file name";
    } else if (missingColumns.length > 0) {
      attachmentState = "error";
      description = `Missing ${missingColumns.length} ${missingColumns.length === 1 ? "column" : "columns"}`;
    } else {
      description = `${size} · Ready to import`;
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Import CSV</CardTitle>
          <CardDescription>
            Import one export file at a time. Large files can take several minutes.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {file ? (
            <>
              <Attachment state={attachmentState} className="w-full">
                <AttachmentMedia>
                  {attachmentState === "uploading" || attachmentState === "processing" ? (
                    <Spinner />
                  ) : (
                    <FileSpreadsheetIcon />
                  )}
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{file.name}</AttachmentTitle>
                  <AttachmentDescription>{description}</AttachmentDescription>
                </AttachmentContent>
                {(status.step === "ready" || status.step === "failed") && (
                  <AttachmentActions>
                    <AttachmentAction aria-label={`Remove ${file.name}`} onClick={clearFile}>
                      <XIcon />
                    </AttachmentAction>
                  </AttachmentActions>
                )}
                {status.step === "uploaded" && progress.data?.done && (
                  <AttachmentActions>
                    <AttachmentAction
                      aria-label={`Download the import log for ${file.name}`}
                      asChild
                    >
                      <a href={`/api/import/${status.importId}/logs`} download>
                        <DownloadIcon />
                      </a>
                    </AttachmentAction>
                  </AttachmentActions>
                )}
              </Attachment>

              {status.step === "uploading" && <Progress value={status.percent} />}
              {status.step === "uploaded" && !importFinished && (
                <>
                  <Progress value={progress.data?.percent ?? 0} />
                  <p className="text-muted-foreground text-sm">
                    {progress.data?.currentStep}. You can leave this page, and the import keeps
                    running.
                  </p>
                </>
              )}

              {status.step === "uploaded" && progress.data?.done && progress.data.error && (
                // Database errors can be long, so the log keeps the rest
                <p className="text-destructive line-clamp-3 text-sm wrap-anywhere">
                  {progress.data.error}
                </p>
              )}
              {missingColumns.length > 0 && (
                <p className="text-muted-foreground text-sm wrap-anywhere">
                  This file doesn't have {missingColumns.join(", ")}. Check it was exported with all
                  of its original columns, with their names unchanged.
                </p>
              )}
              {tableNames.length > 0 &&
                missingColumns.length === 0 &&
                status.step !== "uploaded" && (
                  <p className="text-muted-foreground text-sm">
                    Updates {tableNames.map(formatTableName).join(", ")}.
                  </p>
                )}
              {isCsv && !match.isPending && !match.isError && tableNames.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  The file name tells COBIS which tables to update, so keep the name the export came
                  with, like reg_cuba_demographic_202510_20250117.csv.
                </p>
              )}
              {otherImportRunning && status.step !== "uploaded" && (
                <p className="text-muted-foreground text-sm">
                  Another import is running. You can import this file once it finishes.
                </p>
              )}
            </>
          ) : (
            <FileDropArea onChoose={chooseFile} />
          )}
        </CardContent>

        {file && (
          <CardFooter className="justify-end gap-2">
            {status.step === "uploaded" ? (
              // Only once it's finished, since imports run one file at a time
              <Button variant="outline" onClick={clearFile} disabled={!importFinished}>
                Import another file
              </Button>
            ) : (
              <Button onClick={() => void handleImport()} disabled={!canImport}>
                {status.step === "uploading" ? <Spinner /> : <UploadIcon />}
                {status.step === "failed" ? "Try again" : "Import"}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      <RecentImports
        // The current import already shows its progress above, so it joins the list once it's finished
        jobs={jobs.filter((job) => job.id !== importId || importFinished)}
        isLoading={jobsLoading}
      />
    </div>
  );
}

function RecentImports({ jobs, isLoading }: { jobs: Array<ImportJob>; isLoading: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const shownJobs = showAll ? jobs : jobs.slice(0, RECENT_IMPORT_COUNT);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent imports</CardTitle>
        <CardDescription>
          Logs are stored temporarily, so download any you need to keep.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="px-(--card-spacing)">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-muted-foreground px-(--card-spacing) text-sm">No imports yet.</p>
        ) : (
          <ItemGroup className="gap-0">
            {shownJobs.map((job, index) => (
              <Fragment key={job.id}>
                {index > 0 && <ItemSeparator className="my-0" />}
                <ImportJobRow job={job} />
              </Fragment>
            ))}
          </ItemGroup>
        )}
      </CardContent>
      {jobs.length > RECENT_IMPORT_COUNT && (
        <CardFooter>
          <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show fewer" : `Show all ${jobs.length} imports`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function ImportJobRow({ job }: { job: ImportJob }) {
  const dbClient = useDbClient();
  const queryClient = useQueryClient();
  const isRunning = job.status === "pending" || job.status === "processing";

  // A running import started earlier, or in another tab, still shows its progress here
  const progress = useQuery({
    ...importProgressQuery(job.id),
    enabled: isRunning,
  });
  const finishedWhileOpen = isRunning && progress.data?.done === true;
  // Same as when an import started here finishes, for one started in another tab or by someone else
  useEffect(() => {
    if (!finishedWhileOpen) return;
    void dbClient.collection(importJobsCollection).utils.refetch();
    void queryClient.invalidateQueries();
  }, [finishedWhileOpen, dbClient, queryClient]);

  const startedAt = new Date(job.createdAt);
  let description = format(startedAt, "MMM d, yyyy h:mm a");
  if (isRunning) {
    description = `Importing · ${progress.data?.percent ?? 0}%`;
  } else if (job.status === "failed") {
    description += ` · ${job.error ?? "Import failed"}`;
  } else {
    description += ` · ${(job.totalRows ?? 0).toLocaleString()} rows`;
    // Only worth saying for the larger imports
    const finishedAt = job.completedAt ? new Date(job.completedAt) : null;
    if (finishedAt && finishedAt.getTime() - startedAt.getTime() >= 60_000) {
      description += ` in ${formatDistanceStrict(finishedAt, startedAt)}`;
    }
  }

  return (
    <Item className="rounded-none px-(--card-spacing)">
      {/* min-w-0 and wrap-anywhere let long names and errors wrap instead of widening the page */}
      <ItemContent className="min-w-0">
        <ItemTitle className="wrap-anywhere">{job.fileName ?? "Unknown file"}</ItemTitle>
        <ItemDescription className="wrap-anywhere">{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        {isRunning ? (
          <Badge variant="outline">
            <Spinner />
            Running
          </Badge>
        ) : job.status === "failed" ? (
          <Badge variant="destructive">Failed</Badge>
        ) : (
          <Badge variant="secondary">Done</Badge>
        )}
        {!isRunning && (
          <Button variant="ghost" size="icon-sm" asChild>
            <a
              href={`/api/import/${job.id}/logs`}
              download
              aria-label={`Download the import log for ${job.fileName ?? "this import"}`}
            >
              <DownloadIcon />
            </a>
          </Button>
        )}
      </ItemActions>
    </Item>
  );
}

function FileDropArea({ onChoose }: { onChoose: (file: File | undefined) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Empty
      data-dragging={isDragging}
      className="data-[dragging=true]:border-primary data-[dragging=true]:bg-muted/50 border transition-colors"
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        // Moving over the area's own children also fires dragleave, so only stop once the pointer leaves the area
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        onChoose(event.dataTransfer.files[0]);
      }}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UploadIcon />
        </EmptyMedia>
        <EmptyTitle>Choose a CSV file</EmptyTitle>
        <EmptyDescription>
          Drag it here or use the button below. Keep the export's original file name, since it
          decides which tables get updated.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(event) => {
            onChoose(event.target.files?.[0]);
            // Cleared so choosing the same file again still fires a change
            event.target.value = "";
          }}
        />
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          Choose file
        </Button>
      </EmptyContent>
    </Empty>
  );
}
