import { Link } from "@tanstack/react-router";
import { ClipboardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HubCard } from "@/components/dashboard/hub-card";
import { useTeachingSections } from "@/hooks/use-roster";

type Term = { year: number; term_id: string; description: string };

/**
 * The faculty member's own classes this term, from the same data as Class Roster.
 */
export function TeachingHubCard({ mnumber, term }: { mnumber: string; term: Term }) {
  const { terms, isLoading } = useTeachingSections(mnumber);
  const thisTerm = terms.find((t) => t.year === term.year && t.term_id === term.term_id);
  const sections = thisTerm?.sections ?? [];
  // Seats, so a student in two of the classes counts twice, the same as each section's count
  const enrolled = sections.reduce((total, section) => total + section.enrolled, 0);

  return (
    <HubCard
      icon={<ClipboardIcon />}
      title="Teaching"
      description={
        thisTerm
          ? `Your classes in ${term.description} ${term.year}.`
          : `You aren't teaching in ${term.description} ${term.year}.`
      }
      isLoading={isLoading}
      stats={[
        { label: "Sections", value: sections.length.toLocaleString() },
        { label: "Enrolled", value: enrolled.toLocaleString(), detail: "Drops not counted" },
      ]}
    >
      <Button variant="outline" size="sm" asChild>
        <Link to="/class-roster">Class Roster</Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link to="/instructors/$mnumber" params={{ mnumber }}>
          My Teaching
        </Link>
      </Button>
    </HubCard>
  );
}
