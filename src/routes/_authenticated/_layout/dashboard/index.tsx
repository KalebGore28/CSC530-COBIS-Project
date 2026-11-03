import { createFileRoute } from "@tanstack/react-router";
import { useAuthentication } from "@/lib/auth-client";
import { useCurrentTerm } from "@/providers/current-term-provider";

import { AdvisingHubCard } from "@/components/dashboard/advising-hub-card";
import { DepartmentHubCard } from "@/components/dashboard/department-hub-card";
import { MaintenanceHubCard } from "@/components/dashboard/maintenance-hub-card";
import { TeachingHubCard } from "@/components/dashboard/teaching-hub-card";

import { importJobsCollection } from "@/integrations/tanstack-db/import-jobs";
import { usersCollection } from "@/integrations/tanstack-db/users";

export const Route = createFileRoute("/_authenticated/_layout/dashboard/")({
  beforeLoad: ({ context }) => {
    // Only the maintenance card needs these, and only people who can manage tools may load them
    if (context.userSession?.capabilities.has("tools.manage")) {
      void context.dbClient.collection(usersCollection).preload();
      void context.dbClient.collection(importJobsCollection).preload();
    }
  },
  component: DashboardPage,
  context: () => ({ getTitle: () => "Dashboard" }),
});

/**
 * The place to start: one card for each area the user can use, with links into it.
 */
function DashboardPage() {
  const { userSession, can } = useAuthentication();
  const { currentTerm, isLoading } = useCurrentTerm();
  if (!userSession) return null;

  const mnumber = userSession.user.mnumber;
  // Faculty records have a first name, and accounts without one fall back to the sign-in name
  const firstName = userSession.faculty?.firstName || userSession.user.name.split(" ")[0];

  const showTeaching = can("roster.view") && !!mnumber;
  const showAdvising = can("advisees.view") && !!mnumber;
  const showDepartment = can("enrollment.view");
  const showMaintenance = can("tools.manage");
  const hasCards = showTeaching || showAdvising || showDepartment || showMaintenance;

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground text-sm">
          {isLoading
            ? "Here's what's happening this term."
            : `Here's what's happening in ${currentTerm.description} ${currentTerm.year}.`}
        </p>
      </div>

      {hasCards ? (
        !isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {showTeaching && <TeachingHubCard mnumber={mnumber} term={currentTerm} />}
            {showAdvising && <AdvisingHubCard mnumber={mnumber} term={currentTerm} />}
            {showDepartment && <DepartmentHubCard />}
            {showMaintenance && <MaintenanceHubCard />}
          </div>
        )
      ) : (
        <p className="text-muted-foreground text-sm">
          Your account doesn't have access to any areas yet. Ask a COBIS administrator to assign you
          a role.
        </p>
      )}
    </div>
  );
}
