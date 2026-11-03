import { Link } from "@tanstack/react-router";
import { BookUserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HubCard } from "@/components/dashboard/hub-card";
import { needsAttention } from "@/components/advisees/attention-badges";
import { useAdvisees } from "@/hooks/use-advisees";

type Term = { year: number; term_id: string; description: string };

/**
 * The advisor's students this term, from the same data as the Advisees page.
 */
export function AdvisingHubCard({ mnumber, term }: { mnumber: string; term: Term }) {
  const { advisees, isLoading } = useAdvisees(mnumber, term);
  const attention = advisees.filter(needsAttention);
  const notRegistered = advisees.filter((advisee) => advisee.not_registered).length;

  return (
    <HubCard
      icon={<BookUserIcon />}
      title="Advising"
      description={`Your advisees in ${term.description} ${term.year}.`}
      isLoading={isLoading}
      stats={[
        { label: "Advisees", value: advisees.length.toLocaleString() },
        {
          label: "Need attention",
          value: attention.length.toLocaleString(),
          detail: notRegistered > 0 ? `${notRegistered} not registered` : undefined,
        },
      ]}
    >
      <Button variant="outline" size="sm" asChild>
        <Link to="/advisees">Advisees</Link>
      </Button>
    </HubCard>
  );
}
