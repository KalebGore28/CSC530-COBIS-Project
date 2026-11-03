import { useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DownloadIcon, FileSpreadsheetIcon, HistoryIcon, UploadIcon, XIcon } from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { importProgressQuery } from "@/lib/import-progress";
import { uploadCsv } from "@/lib/upload";

export const Route = createFileRoute("/_authenticated/_layout/tools/_layout/import")({
  component: ImportPage,
  context: () => ({ getTitle: () => "Import" }),
});

type UploadStatus =
  | { step: "ready" }
  | { step: "uploading"; percent: number }
  | { step: "uploaded"; importId: string }
  | { step: "failed"; message: string };

type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";

// The file name decides which tables an import updates, so it's checked before uploading
async function fetchMatchingTables(fileName: string): Promise<Array<string>> {
  const response = await fetch(`/api/import/match?filename=${encodeURIComponent(fileName)}`);
  if (!response.ok) throw new Error(`Could not check the file name (${response.status})`);
  const body = (await response.json()) as { tableNames: Array<string> };
  return body.tableNames;
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
    queryKey: ["import-match", file?.name],
    queryFn: () => fetchMatchingTables(file?.name ?? ""),
    enabled: isCsv,
  });
  const tableNames = isCsv ? (match.data ?? []) : [];
  const canImport = tableNames.length > 0 && (status.step === "ready" || status.step === "failed");

  // Streams the import's progress once the file is on the server
  const importId = status.step === "uploaded" ? status.importId : "";
  const progress = useQuery(importProgressQuery(importId));
  const importFinished = progress.data?.done === true || progress.isError;

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
      description = `${size} · Checking file name…`;
    } else if (match.isError) {
      attachmentState = "error";
      description = "Couldn't check the file name. Try choosing it again.";
    } else if (tableNames.length === 0) {
      attachmentState = "error";
      description = "COBIS doesn't recognize this file name";
    } else {
      description = `${size} · Ready to import`;
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Import CSV</CardTitle>
          <CardDescription>
            Import one export file at a time. Large files can take several minutes.
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" asChild>
              <Link to="/tools/import/history">
                <HistoryIcon />
                History
              </Link>
            </Button>
          </CardAction>
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
                <p className="text-destructive line-clamp-3 text-sm break-words">
                  {progress.data.error}
                </p>
              )}
              {tableNames.length > 0 && status.step !== "uploaded" && (
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
    </div>
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
