import { Outlet, createFileRoute } from "@tanstack/react-router";
import { requirePageCapability } from "@/lib/page-guards";

export const Route = createFileRoute("/_authenticated/_layout/tools")({
  beforeLoad: ({ context }) => {
    requirePageCapability(context.userSession, "tools.manage");
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto py-6">
      <Outlet />
    </div>
  );
}
