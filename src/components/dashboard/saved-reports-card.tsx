import { useLiveQuery } from "@tanstack/react-db";
import { BookmarkIcon, ChevronRightIcon, StarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SavedReportLink, byFavoriteThenName } from "@/components/saved-reports/saved-reports";
import { useAuthentication } from "@/lib/auth-client";
import { REPORT_PAGES } from "@/lib/saved-reports";
import { savedReportsCollection } from "@/integrations/tanstack-db/saved-reports";

// Enough to rerun the usual ones without the card outgrowing the others
const SHOWN = 6;

/**
 * The user's saved reports, favorites first, one click from running again.
 * Hidden until they've saved one.
 */
export function SavedReportsCard() {
  const { can } = useAuthentication();
  const { data, isLoading } = useLiveQuery({
    query: (q) => q.from({ reports: savedReportsCollection }),
  });

  // A report from a page they've since lost access to would only lead to an error
  const reports = data
    .filter((report) => can(REPORT_PAGES[report.page]?.capability))
    .sort(byFavoriteThenName);
  if (!isLoading && reports.length === 0) return null;

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 [&_svg]:size-4">
          <BookmarkIcon />
          Saved reports
        </CardTitle>
        <CardDescription>Your saved filters, run against current data.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24" />
        ) : (
          <ul className="-mx-2">
            {reports.slice(0, SHOWN).map((report) => (
              <li key={report.id}>
                <SavedReportLink
                  report={report}
                  className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                >
                  <StarIcon
                    aria-label={report.is_favorite ? "Favorite" : undefined}
                    aria-hidden={!report.is_favorite}
                    className={
                      report.is_favorite
                        ? "size-3.5 shrink-0 fill-current text-amber-500"
                        : "invisible size-3.5 shrink-0"
                    }
                  />
                  <span className="min-w-0 flex-1 truncate">{report.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {REPORT_PAGES[report.page]?.label}
                  </span>
                  <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
                </SavedReportLink>
              </li>
            ))}
          </ul>
        )}
        {reports.length > SHOWN && (
          <p className="text-muted-foreground mt-2 text-xs">
            {reports.length - SHOWN} more on the page each was saved from.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
