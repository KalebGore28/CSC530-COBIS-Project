import { createFileRoute } from "@tanstack/react-router";

import { useLiveQuery } from "@tanstack/react-db";
import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";
import { RegistrationStatusTable } from "@/components/tables/registration-status-table";

type RouteParams = {
  filterColumn?: string;
  filterValue?: string;
};

export const Route = createFileRoute(
  "/_authenticated/_layout/cobis-tools/manage-tables/_layout/registration-statuses",
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
  const { data: registrationStatus, isLoading } = useLiveQuery((q) =>
    q.from({ registrationStatus: registrationStatusCollection }),
  );
  return (
    <div>
      {!isLoading && (
        <RegistrationStatusTable
          data={registrationStatus}
          filterColumn={filterColumn}
          filterValue={filterValue}
        />
      )}
    </div>
  );
}
