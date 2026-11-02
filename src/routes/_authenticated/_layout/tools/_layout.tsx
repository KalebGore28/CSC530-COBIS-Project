import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { requirePageCapability } from "@/lib/page-guards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/_layout/tools/_layout")({
  beforeLoad: ({ context }) => {
    requirePageCapability(context.userSession, "tools.manage");
  },
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();

  const activeTab = location.pathname.split("/").pop() || "import";
  return (
    <div className="container mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tools</CardTitle>
          <CardDescription>Access various tools and utilities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab}>
            <TabsList>
              <TabsTrigger value="users">
                <Link to="/tools/users">Users</Link>
              </TabsTrigger>
              <TabsTrigger value="permissions">
                <Link to="/tools/permissions">Permissions</Link>
              </TabsTrigger>
              <TabsTrigger value="manage-tables">
                <Link to="/tools/manage-tables">Manage Tables</Link>
              </TabsTrigger>
              <TabsTrigger value="import">
                <Link to="/tools/import">Import</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Nested routes render here */}
      <Outlet />
    </div>
  );
}
