import { Outlet, createFileRoute } from "@tanstack/react-router";
import { requirePageCapability } from "@/lib/page-guards";

export const Route = createFileRoute("/_authenticated/_layout/enrollment")({
  beforeLoad: ({ context }) => {
    requirePageCapability(context.userSession, "enrollment.view");
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
