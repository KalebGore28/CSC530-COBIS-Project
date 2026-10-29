import { createFileRoute } from "@tanstack/react-router";

import { useLiveQuery } from "@tanstack/react-db";
import { admitCodesCollection } from "@/integrations/tanstack-db/admit-codes";
import { AdmitCodesTable } from "@/components/tables/admit-codes-table";

type RouteParams = {
  filterColumn?: string;
  filterValue?: string;
};

export const Route = createFileRoute(
  "/_authenticated/_layout/cobis-tools/manage-tables/_layout/admit-codes",
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
  const { data: admitCodes, isLoading } = useLiveQuery((q) =>
    q.from({ admitCodes: admitCodesCollection }),
  );
  return (
    <div>
      {!isLoading && (
        <AdmitCodesTable data={admitCodes} filterColumn={filterColumn} filterValue={filterValue} />
      )}
    </div>
  );
}
