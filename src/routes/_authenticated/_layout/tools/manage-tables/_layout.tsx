import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { GoBackButton } from "@/components/common/go-back-button";

export const Route = createFileRoute("/_authenticated/_layout/tools/manage-tables/_layout")({
  component: RouteComponent,
  context: () => ({ getTitle: () => "Manage Tables" }),
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <GoBackButton fallback={{ to: "/tools/manage-tables" }} variant="outline" className="w-fit">
        <ArrowLeft />
        Back
      </GoBackButton>

      <Outlet />
    </div>
  );
}
