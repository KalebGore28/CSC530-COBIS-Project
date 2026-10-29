import { useLocation } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/providers/theme";
import { useBreadcrumb } from "@/providers/breadcrumb";
import { AppBreadcrumbs } from "./app-breadcrumbs";

export function SiteHeader() {
  const location = useLocation();
  const { segmentOverrides } = useBreadcrumb();

  // Generate breadcrumb items from the current pathname
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;

    // Check if we have an override for this segment
    if (segmentOverrides[segment]) {
      return { path, title: segmentOverrides[segment] };
    }

    // Otherwise, use the default formatting
    const title = segment
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return { path, title };
  });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <AppBreadcrumbs breadcrumbs={breadcrumbs} />
      <ModeToggle className="mr-4 ml-auto shadow-xs" />
    </header>
  );
}
