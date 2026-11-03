import { useRouterState } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/providers/theme";
import { AppBreadcrumbs } from "./app-breadcrumbs";

export function SiteHeader() {
  const matches = useRouterState({ select: (state) => state.matches });

  // Routes inherit getTitle from their parent, so only the route that set it adds a crumb
  const breadcrumbs = matches.flatMap((match, index) => {
    const { getTitle } = match.context;
    if (!getTitle || getTitle === matches[index - 1]?.context.getTitle) return [];
    return [{ title: getTitle(), path: match.pathname }];
  });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <SidebarTrigger className="-ml-1" />
      <AppBreadcrumbs breadcrumbs={breadcrumbs} />
      <ModeToggle className="ml-auto shadow-xs" />
    </header>
  );
}
