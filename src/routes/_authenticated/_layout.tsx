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
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="px-(--page-gutter)">
            <SiteHeader />
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </CurrentTermProvider>
  );
}
