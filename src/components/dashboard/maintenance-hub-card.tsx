import { Link } from "@tanstack/react-router";
import { isNull, useLiveQuery } from "@tanstack/react-db";
import { WrenchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HubCard } from "@/components/dashboard/hub-card";
import { useTableProblems } from "@/hooks/use-table-problems";

import { importJobsCollection } from "@/integrations/tanstack-db/import-jobs";
import { usersCollection } from "@/integrations/tanstack-db/users";

const IMPORT_STATUS: Record<string, string> = {
  pending: "Waiting",
  processing: "Running",
  done: "Done",
  failed: "Failed",
};

/**
 * What needs a COBIS administrator's attention, from the same data as the tools pages.
 */
export function MaintenanceHubCard() {
  const { data: unassignedUsers, isLoading: usersLoading } = useLiveQuery({
    query: (q) => q.from({ users: usersCollection }).where(({ users }) => isNull(users.mnumber)),
  });

  // The same counts as Manage Tables, so the two always agree
  const { tables, isLoading: tablesLoading } = useTableProblems();
  const tablesNeedingAttention = tables.filter((table) => table.problems.length > 0).length;

  const { data: latestImport, isLoading: importsLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ jobs: importJobsCollection })
        .orderBy(({ jobs }) => jobs.createdAt, "desc")
        .findOne(),
  });

  return (
    <HubCard
      icon={<WrenchIcon />}
      title="Maintenance"
      description="Users, tables and imports."
      isLoading={usersLoading || tablesLoading || importsLoading}
      stats={[
        {
          label: "Users without an M-Number",
          value: unassignedUsers.length.toLocaleString(),
          detail: unassignedUsers.length === 0 ? "All users are assigned" : "Assign them on Users",
        },
        {
          label: "Tables needing attention",
          value: tablesNeedingAttention.toLocaleString(),
          detail: `of ${tables.length}`,
        },
        {
          label: "Last import",
          value: latestImport
            ? (IMPORT_STATUS[latestImport.status] ?? latestImport.status)
            : "None",
          detail: latestImport
            ? `${latestImport.fileName ?? "Unknown file"} · ${new Date(latestImport.createdAt).toLocaleDateString()}`
            : undefined,
        },
      ]}
    >
      <Button variant="outline" size="sm" asChild>
        <Link to="/tools/users">Users</Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link to="/tools/manage-tables">Manage Tables</Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link to="/tools/import">Import</Link>
      </Button>
    </HubCard>
  );
}
