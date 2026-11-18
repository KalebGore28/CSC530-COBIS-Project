import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/core/sidebar";
import { SiteHeader } from "@/components/core/header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { CurrentTermProvider } from "@/providers/current-term-provider";

// Import collections to preload data
import { academicStandingCollection } from "@/integrations/tanstack-db/academic-standing";
import { admitCodesCollection } from "@/integrations/tanstack-db/admit-codes";
import { collegesCollection } from "@/integrations/tanstack-db/colleges";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { instructionalMethodsCollection } from "@/integrations/tanstack-db/instructional-methods";
import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";
import { partOfTermCollection } from "@/integrations/tanstack-db/part-of-term";
import { termsCollection } from "@/integrations/tanstack-db/terms";
import { programsCollection } from "@/integrations/tanstack-db/programs";
import { currentTermCollection } from "@/integrations/tanstack-db/current-term";

export const Route = createFileRoute("/_authenticated/_layout")({
  beforeLoad: async ({ context }) => {
    const dbClient = context.dbClient;

    // Materialize descriptors and trigger preloads in parallel
    await Promise.all([
      dbClient.collection(academicStandingCollection).preload(),
      dbClient.collection(admitCodesCollection).preload(),
      dbClient.collection(collegesCollection).preload(),
      dbClient.collection(departmentsCollection).preload(),
      dbClient.collection(coursesCollection).preload(),
      dbClient.collection(instructionalMethodsCollection).preload(),
      dbClient.collection(registrationStatusCollection).preload(),
      dbClient.collection(partOfTermCollection).preload(),
      dbClient.collection(programsCollection).preload(),
      dbClient.collection(termsCollection).preload(),
      dbClient.collection(currentTermCollection).preload(),
      // ... add other small/mid collections here
    ]);
  },
  component: App,
  ssr: false,
});

function App() {
  return (
    <CurrentTermProvider>
      <TooltipProvider>
        <Toaster richColors />
        {/* First thing Tab reaches, so keyboard users can jump past the sidebar's links.
            Hidden until focused. */}
        <a
          href="#main-content"
          className="bg-background text-foreground ring-ring sr-only z-50 rounded-md px-4 py-2 font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2"
        >
          Skip to main content
        </a>
        <SidebarProvider>
          <AppSidebar />
          {/* tabIndex -1 lets the skip link move focus here (screen magnifiers follow it) without
              adding it to the Tab order */}
          <SidebarInset
            id="main-content"
            tabIndex={-1}
            className="px-(--page-gutter) focus:outline-none"
          >
            <SiteHeader />
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </CurrentTermProvider>
  );
}
