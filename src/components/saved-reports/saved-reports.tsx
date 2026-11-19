import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { eq, useDbClient, useLiveQuery } from "@tanstack/react-db";
import { BookmarkIcon, BookmarkPlusIcon, StarIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { REPORT_NAME_MAX_LENGTH, REPORT_PAGES, reportSearch } from "@/lib/saved-reports";
import type { ReportPage } from "@/lib/saved-reports";
import { savedReportsCollection } from "@/integrations/tanstack-db/saved-reports";
import type { SavedReport } from "@/integrations/tanstack-db/saved-reports";

// Favorites first, then by name
export function byFavoriteThenName(a: SavedReport, b: SavedReport) {
  if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
  return a.name.localeCompare(b.name);
}

// Key order doesn't matter, so the same filters always compare equal
function sameSearch(a: Record<string, unknown>, b: Record<string, unknown>) {
  const normalize = (search: Record<string, unknown>) =>
    JSON.stringify(Object.entries(search).sort(([x], [y]) => x.localeCompare(y)));
  return normalize(a) === normalize(b);
}

/**
 * Opens a saved report: its page, with the filters it was saved with.
 * The page re-checks them, so filters an older version of the page understood are dropped.
 */
export function SavedReportLink({
  report,
  className,
  children,
  onClick,
}: {
  report: SavedReport;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={report.page}
      // Each page validates its own search, so the saved JSON doesn't need to match its type here
      search={report.search as never}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

function FavoriteToggle({ report }: { report: SavedReport }) {
  const collection = useDbClient().collection(savedReportsCollection);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={report.is_favorite ? `Unfavorite ${report.name}` : `Favorite ${report.name}`}
      aria-pressed={report.is_favorite}
      onClick={() => {
        const tx = collection.update(report.id, (draft) => {
          draft.is_favorite = !draft.is_favorite;
        });
        tx.isPersisted.promise.catch((error: Error) => toast.error(error.message));
      }}
    >
      <StarIcon className={cn(report.is_favorite && "fill-current text-amber-500")} />
    </Button>
  );
}

/**
 * Saves the filters on screen as a named report.
 */
export function SaveReportButton({
  page,
  search,
  disabled,
}: {
  page: ReportPage;
  search: Record<string, unknown>;
  disabled?: boolean;
}) {
  const collection = useDbClient().collection(savedReportsCollection);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  const filters = reportSearch(search);
  const { data: reports } = useLiveQuery({
    query: (q) =>
      q.from({ reports: savedReportsCollection }).where(({ reports }) => eq(reports.page, page)),
  });
  const savedAs = reports.find((report) => sameSearch(report.search, filters));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    const tx = collection.insert({
      id: crypto.randomUUID(),
      name: trimmed,
      page,
      search: filters,
      is_favorite: favorite,
      created_at: new Date().toISOString(),
    });
    try {
      await tx.isPersisted.promise;
      toast.success(`Saved "${trimmed}"`);
      setOpen(false);
      setName("");
      setFavorite(false);
    } catch (error) {
      // The insert is rolled back, so the dialog stays open to pick another name
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || !!savedAs}
          className="max-md:flex-1"
          title={savedAs ? `These filters are saved as "${savedAs.name}"` : undefined}
        >
          <BookmarkPlusIcon />
          {savedAs ? "Saved" : "Save report"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={(event) => void save(event)} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Save report</DialogTitle>
            <DialogDescription>
              Saves these filters, not the results. Running it again shows current data.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="report-name">Name</FieldLabel>
              <Input
                id="report-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={REPORT_NAME_MAX_LENGTH}
                placeholder="e.g. Accounting seniors, 3.5+ GPA"
                autoFocus
                required
              />
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="report-favorite"
                checked={favorite}
                onCheckedChange={(checked) => setFavorite(checked === true)}
              />
              <FieldLabel htmlFor="report-favorite" className="font-normal">
                Add to favorites on the dashboard
              </FieldLabel>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={saving || !name.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The reports saved from this page: open one, favorite it, or delete it.
 */
export function SavedReportsButton({ page }: { page: ReportPage }) {
  const collection = useDbClient().collection(savedReportsCollection);
  const [open, setOpen] = useState(false);
  const { data } = useLiveQuery({
    query: (q) =>
      q.from({ reports: savedReportsCollection }).where(({ reports }) => eq(reports.page, page)),
  });
  const reports = [...data].sort(byFavoriteThenName);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="max-md:flex-1">
          <BookmarkIcon />
          Saved reports
          {reports.length > 0 && (
            <span className="text-muted-foreground tabular-nums">{reports.length}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-2 p-2">
        <PopoverHeader className="px-2 pt-1">
          <PopoverTitle>Saved reports</PopoverTitle>
          <PopoverDescription>Your saved {REPORT_PAGES[page].label} filters.</PopoverDescription>
        </PopoverHeader>
        {reports.length === 0 ? (
          <p className="text-muted-foreground px-2 pb-2 text-sm">
            Nothing saved yet. Pick some filters, then use Save report.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {reports.map((report) => (
              <li key={report.id} className="hover:bg-muted flex items-center gap-1 rounded-md">
                <SavedReportLink
                  report={report}
                  onClick={() => setOpen(false)}
                  className="min-w-0 flex-1 truncate px-2 py-1.5 text-sm"
                >
                  {report.name}
                </SavedReportLink>
                <FavoriteToggle report={report} />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${report.name}`}
                  onClick={() => {
                    const tx = collection.delete(report.id);
                    tx.isPersisted.promise
                      .then(() => toast.success(`Deleted "${report.name}"`))
                      .catch((error: Error) => toast.error(error.message));
                  }}
                >
                  <Trash2Icon />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
