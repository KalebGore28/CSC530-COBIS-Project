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
import { SectionRoster } from "@/components/roster/section-roster";

import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { termsCollection } from "@/integrations/tanstack-db/terms";

// One value each, like "2025-90" and "ACC609-001", matching the class roster page
type EnrollmentRosterSearch = {
  term?: string;
  section?: string;
  instructor?: string;
};

function parseTerm(key: string | undefined) {
  const match = key ? /^(\d{4})-(\w+)$/.exec(key) : null;
  return match ? { year: Number(match[1]), term_id: match[2] } : undefined;
}

// The section number comes after the last dash, since that's where the page put it
function parseSection(key: string | undefined) {
  const dash = key?.lastIndexOf("-") ?? -1;
  return key && dash > 0
    ? { courseId: key.slice(0, dash), section: key.slice(dash + 1) }
    : undefined;
}

/**
 * A roster for any section of the department's courses, opened from Enrollment's Sections tab.
 * It's for anyone who can see enrollment, like an admin assistant, so it never shows grades or attendance,
 * even to viewers who could see some through teaching or advising. Chairs see grades from the Instructors pages.
 */
export const Route = createFileRoute("/_authenticated/_layout/enrollment/roster")({
  beforeLoad: ({ context }) => {
    void context.dbClient.collection(termsCollection).preload();
    void context.dbClient.collection(coursesCollection).preload();
  },
  validateSearch: (search): EnrollmentRosterSearch => ({
    term: typeof search.term === "string" ? search.term : undefined,
    section: typeof search.section === "string" ? search.section : undefined,
    instructor: typeof search.instructor === "string" ? search.instructor : undefined,
  }),
  component: EnrollmentRosterPage,
  context: () => ({ getTitle: () => "Roster" }),
});

function EnrollmentRosterPage() {
  const search: EnrollmentRosterSearch = Route.useSearch();
  const term = parseTerm(search.term);
  const section = parseSection(search.section);

  const { data: termName } = useLiveQuery(
    {
      query: (q) =>
        q
          .from({ terms: termsCollection })
          .where(({ terms }) => eq(terms.id, term?.term_id ?? ""))
          .findOne(),
    },
    [term?.term_id],
  );
  const { data: course } = useLiveQuery(
    {
      query: (q) =>
        q
          .from({ courses: coursesCollection })
          .where(({ courses }) => eq(courses.id, section?.courseId ?? ""))
          .findOne(),
    },
    [section?.courseId],
  );

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link to="/enrollment" search={{ term: search.term, tab: "sections" }}>
          <ArrowLeftIcon />
          Enrollment
        </Link>
      </Button>

      {term && section && search.instructor ? (
        <SectionRoster
          instructorMnumber={search.instructor}
          term={{ ...term, description: termName?.description ?? term.term_id }}
          courseId={section.courseId}
          section={section.section}
          title={course?.title ?? ""}
          withoutGrades
        />
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardListIcon />
            </EmptyMedia>
            <EmptyTitle>Section not found</EmptyTitle>
            <EmptyDescription>
              The link is incomplete. Open a section from Enrollment's Sections tab.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
