import { createFileRoute } from "@tanstack/react-router";

import { useLiveQuery } from "@tanstack/react-db";
import { programsCollection } from "@/integrations/tanstack-db/programs";
import { ProgramsTable } from "@/components/tables/programs-table";

type RouteParams = {
  filterColumn?: string;
  filterValue?: string;
};

export const Route = createFileRoute(
  "/_authenticated/_layout/cobis-tools/manage-tables/_layout/programs",
)({
  component: RouteComponent,
  validateSearch: (search): RouteParams => {
    return {
      filterColumn: search.filterColumn as string | undefined,
      filterValue: search.filterValue as string | undefined,
    };
  },
});

function RouteComponent() {
  const { filterColumn, filterValue } = Route.useSearch();
  const { data: programs, isLoading } = useLiveQuery((q) =>
    q.from({ programs: programsCollection }),
  );
  return (
    <div>
      {!isLoading && (
        <ProgramsTable data={programs} filterColumn={filterColumn} filterValue={filterValue} />
      )}
    </div>
  );
}
