import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { requirePageCapability } from "@/lib/page-guards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/_layout/enrollment/_layout")({
  beforeLoad: ({ context }) => {
    requirePageCapability(context.userSession, "enrollment.view");
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
          <CardTitle>Enrollment Metrics</CardTitle>
          <CardDescription>Access various tools and utilities for Enrollment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab}>
            <TabsList>
              <TabsTrigger value="programs">
                <Link to="/enrollment/programs">Programs</Link>
              </TabsTrigger>
              <TabsTrigger value="courses">
                <Link to="/enrollment/courses">Courses</Link>
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
