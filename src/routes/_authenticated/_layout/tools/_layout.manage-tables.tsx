import { Fragment } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ManagedTableContent } from "@/components/tables/managed-table-content";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTableProblems } from "@/hooks/use-table-problems";
import type { ManagedTableSlug } from "@/hooks/use-table-problems";

import { academicStandingCollection } from "@/integrations/tanstack-db/academic-standing";
import { admitCodesCollection } from "@/integrations/tanstack-db/admit-codes";
import { collegesCollection } from "@/integrations/tanstack-db/colleges";
import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { coursePrefixesCollection } from "@/integrations/tanstack-db/course-prefixes";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { instructionalMethodsCollection } from "@/integrations/tanstack-db/instructional-methods";
import { partOfTermCollection } from "@/integrations/tanstack-db/part-of-term";
import { programsCollection } from "@/integrations/tanstack-db/programs";
import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";

const TABLE_SLUGS: Array<ManagedTableSlug> = [
  "academic-standings",
  "admit-codes",
  "colleges",
  "courses",
  "course-prefixes",
  "departments",
  "instructional-methods",
  "part-of-terms",
  "programs",
  "registration-statuses",
];

// The open side panel lives in the URL, so Back closes it and links can open it directly
type ManageTablesSearch = {
  table?: ManagedTableSlug;
  filterColumn?: string;
  filterValue?: string;
};

export const Route = createFileRoute("/_authenticated/_layout/tools/_layout/manage-tables")({
  beforeLoad: ({ context }) => {
    const dbClient = context.dbClient;
    void dbClient.collection(academicStandingCollection).preload();
    void dbClient.collection(admitCodesCollection).preload();
    void dbClient.collection(collegesCollection).preload();
    void dbClient.collection(coursesCollection).preload();
    void dbClient.collection(coursePrefixesCollection).preload();
    void dbClient.collection(departmentsCollection).preload();
    void dbClient.collection(instructionalMethodsCollection).preload();
    void dbClient.collection(partOfTermCollection).preload();
    void dbClient.collection(programsCollection).preload();
    void dbClient.collection(registrationStatusCollection).preload();
  },
  validateSearch: (search): ManageTablesSearch => {
    const table = TABLE_SLUGS.find((slug) => slug === search.table);
    return {
      table,
      filterColumn: table ? (search.filterColumn as string | undefined) : undefined,
      filterValue: table ? (search.filterValue as string | undefined) : undefined,
    };
  },
  component: RouteComponent,
  context: () => ({ getTitle: () => "Manage Tables" }),
});

// Opens the side panel on larger screens, and the full table page on phones where a panel is too narrow
function TableLink({
  slug,
  filterColumn,
  filterValue,
  className,
  children,
}: {
  slug: ManagedTableSlug;
  filterColumn?: string;
  filterValue?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Link
        to={`/tools/manage-tables/${slug}`}
        search={{ filterColumn, filterValue }}
        className={className}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      to="/tools/manage-tables"
      search={{ table: slug, filterColumn, filterValue }}
      className={className}
    >
      {children}
    </Link>
  );
}

function RouteComponent() {
  const search: ManageTablesSearch = Route.useSearch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { tables, isLoading } = useTableProblems();

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  const countProblems = (problems: Array<{ count: number }>) =>
    problems.reduce((sum, problem) => sum + problem.count, 0);

  // Most problems first, then alphabetical so tables without problems keep a steady order
  const sortedTables = [...tables].sort(
    (a, b) => countProblems(b.problems) - countProblems(a.problems) || a.name.localeCompare(b.name),
  );
  const tablesWithProblems = tables.filter((table) => table.problems.length > 0).length;
  const openTable = tables.find((table) => table.slug === search.table);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tables</CardTitle>
          <CardDescription>
            {tablesWithProblems === 0
              ? "All tables are up to date."
              : `${tablesWithProblems} of ${tables.length} tables need attention.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <ItemGroup className="gap-0">
            {sortedTables.map((table, index) => (
              <Fragment key={table.slug}>
                {index > 0 && <ItemSeparator className="my-0" />}
                {/* The title link stretches over the whole row, and the problem links sit above it */}
                <Item className="hover:bg-muted/50 relative rounded-none px-(--card-spacing)">
                  <ItemContent className="gap-2">
                    <ItemTitle>
                      <TableLink slug={table.slug} className="after:absolute after:inset-0">
                        {table.name}
                      </TableLink>
                    </ItemTitle>
                    {table.problems.length === 0 ? (
                      <ItemDescription>No issues</ItemDescription>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-md:gap-2">
                        {table.problems.map((problem) => (
                          <Badge
                            key={problem.filterColumn}
                            variant="outline"
                            className="relative z-10 max-md:h-(--control-height) max-md:px-3 max-md:text-sm"
                            asChild
                          >
                            <TableLink
                              slug={table.slug}
                              filterColumn={problem.filterColumn}
                              filterValue={problem.filterValue}
                            >
                              {problem.count} {problem.label}
                            </TableLink>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </ItemContent>
                  <ItemActions>
                    <ChevronRightIcon className="text-muted-foreground size-4" />
                  </ItemActions>
                </Item>
              </Fragment>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>

      <Sheet
        open={!!openTable && !isMobile}
        onOpenChange={(open) => {
          if (!open) void navigate({ to: "/tools/manage-tables", search: {} });
        }}
      >
        <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-4xl">
          {openTable && (
            <>
              <SheetHeader className="pr-12">
                <SheetTitle>{openTable.name}</SheetTitle>
                <SheetDescription>
                  {openTable.problems.length === 0
                    ? "No issues"
                    : openTable.problems
                        .map((problem) => `${problem.count} ${problem.label}`)
                        .join(" · ")}
                </SheetDescription>
                <Button variant="outline" size="sm" className="mt-2 w-fit" asChild>
                  <Link
                    to={`/tools/manage-tables/${openTable.slug}`}
                    search={{
                      filterColumn: search.filterColumn,
                      filterValue: search.filterValue,
                    }}
                  >
                    Open full page
                    <ExternalLinkIcon />
                  </Link>
                </Button>
              </SheetHeader>
              {/* Keyed so switching tables or problems starts the table's filter fresh */}
              <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">
                <ManagedTableContent
                  key={`${openTable.slug}-${search.filterColumn}-${search.filterValue}`}
                  slug={openTable.slug}
                  filterColumn={search.filterColumn}
                  filterValue={search.filterValue}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
