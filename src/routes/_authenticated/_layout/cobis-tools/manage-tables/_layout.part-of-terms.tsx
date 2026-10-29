import { createFileRoute } from "@tanstack/react-router";

import { useLiveQuery } from "@tanstack/react-db";
import { partOfTermCollection } from "@/integrations/tanstack-db/part-of-term";
import { PartOfTermTable } from "@/components/tables/part-of-term-table";

type RouteParams = {
  filterColumn?: string;
  filterValue?: string;
};

export const Route = createFileRoute(
  "/_authenticated/_layout/cobis-tools/manage-tables/_layout/part-of-terms",
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
  const { data: partOfTerms, isLoading } = useLiveQuery((q) =>
    q.from({ partOfTerms: partOfTermCollection }),
  );
  return (
    <div>
      {!isLoading && (
        <PartOfTermTable data={partOfTerms} filterColumn={filterColumn} filterValue={filterValue} />
      )}
    </div>
  );
}
