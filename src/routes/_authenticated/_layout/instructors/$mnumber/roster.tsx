import { Link, createFileRoute } from "@tanstack/react-router";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { ArrowLeftIcon, ClipboardListIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionRoster } from "@/components/roster/section-roster";
import { useTeachingSections } from "@/hooks/use-roster";
import { requirePageCapability } from "@/lib/page-guards";

import { facultyCollection } from "@/integrations/tanstack-db/faculty";

// One value each, like "2025-90" and "ACC609-001", matching the class roster page
type InstructorRosterSearch = {
  term?: string;
  section?: string;
};

export const Route = createFileRoute("/_authenticated/_layout/instructors/$mnumber/roster")({
  beforeLoad: ({ context, params }) => {
    // The same rule as the instructor's page: their own rosters, or anyone's with instructors.view
    if (context.userSession?.user.mnumber !== params.mnumber) {
      requirePageCapability(context.userSession, "instructors.view");
    }

    void context.dbClient.collection(facultyCollection).preload();
  },
  validateSearch: (search): InstructorRosterSearch => ({
    term: typeof search.term === "string" ? search.term : undefined,
    section: typeof search.section === "string" ? search.section : undefined,
  }),
  component: InstructorRosterPage,
  context: () => ({ getTitle: () => "Roster" }),
});

function InstructorRosterPage() {
  const { mnumber } = Route.useParams();
  const search: InstructorRosterSearch = Route.useSearch();
  const { terms, isLoading } = useTeachingSections(mnumber);

  const { data: instructor } = useLiveQuery({
    query: (q) =>
      q
        .from({ faculty: facultyCollection })
        .where(({ faculty }) => eq(faculty.mnumber, mnumber))
        .findOne(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-4 py-6">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const term = terms.find((t) => `${t.year}-${t.term_id}` === search.term);
  const section = term?.sections.find((s) => `${s.course_id}-${s.section}` === search.section);

  return (
    <div className="container mx-auto space-y-4 py-6">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link to="/instructors/$mnumber" params={{ mnumber }}>
          <ArrowLeftIcon />
          {instructor ? `${instructor.first_name} ${instructor.last_name}` : "Instructor"}
        </Link>
      </Button>

      {term && section ? (
        <SectionRoster
          instructorMnumber={mnumber}
          term={term}
          courseId={section.course_id}
          section={section.section}
          title={section.title}
        />
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardListIcon />
            </EmptyMedia>
            <EmptyTitle>Section not found</EmptyTitle>
            <EmptyDescription>
              This instructor didn't teach that section, or the link is incomplete.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
