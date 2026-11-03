import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/_layout/tools/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();

  const activeTab = location.pathname.split("/").pop() || "import";
  return (
    <div className="space-y-6">
      {/* The sidebar has these links on larger screens, but is hidden behind a menu below md */}
      <Tabs value={activeTab} className="md:hidden">
        <TabsList variant="line" className="w-full gap-0 p-0 *:h-full">
          <TabsTrigger value="users" asChild>
            <Link to="/tools/users">Users</Link>
          </TabsTrigger>
          <TabsTrigger value="permissions" asChild>
            <Link to="/tools/permissions">Permissions</Link>
          </TabsTrigger>
          <TabsTrigger value="manage-tables" asChild>
            <Link to="/tools/manage-tables">Tables</Link>
          </TabsTrigger>
          <TabsTrigger value="import" asChild>
            <Link to="/tools/import">Import</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Nested routes render here */}
      <Outlet />
    </div>
  );
}
