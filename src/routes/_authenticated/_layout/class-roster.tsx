import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClipboardListIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionRoster } from "@/components/roster/section-roster";
import { useTeachingSections } from "@/hooks/use-roster";
import type { TeachingTerm } from "@/hooks/use-roster";
import { useAuthentication } from "@/lib/auth-client";
import { requirePageCapability } from "@/lib/page-guards";

import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { termsCollection } from "@/integrations/tanstack-db/terms";

// The term and section live in the URL, so a refresh or Back keeps the same roster open.
// Both are one value, like "2025-90" and "ACC609-001", since the router would quote a lone "90".
type ClassRosterSearch = {
  term?: string;
  section?: string;
};

export const Route = createFileRoute("/_authenticated/_layout/class-roster")({
  beforeLoad: ({ context }) => {
    requirePageCapability(context.userSession, "roster.view");

    const dbClient = context.dbClient;
    void dbClient.collection(termsCollection).preload();
    void dbClient.collection(coursesCollection).preload();
  },
  validateSearch: (search): ClassRosterSearch => ({
    term: typeof search.term === "string" ? search.term : undefined,
    section: typeof search.section === "string" ? search.section : undefined,
  }),
  component: ClassRosterPage,
  context: () => ({ getTitle: () => "Class Roster" }),
});

function termKey(term: { year: number; term_id: string }) {
  return `${term.year}-${term.term_id}`;
}

function sectionKey(section: { course_id: string; section: string }) {
  return `${section.course_id}-${section.section}`;
}

function RosterMessage({ title, description }: { title: string; description: string }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardListIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function ClassRosterPage() {
  const search: ClassRosterSearch = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { userSession } = useAuthentication();
  const instructorMnumber = userSession?.user.mnumber ?? "";
  const { terms, isLoading } = useTeachingSections(instructorMnumber);

  if (!userSession || isLoading) {
    return (
      <div className="container mx-auto space-y-4 py-6">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (terms.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <RosterMessage
          title="No classes yet"
          description="Rosters show up here once you're listed as the instructor for a course."
        />
      </div>
    );
  }

  // Without a choice in the URL, open the newest term and its first section with students
  const term: TeachingTerm = terms.find((t) => termKey(t) === search.term) ?? terms[0];
  const section =
    term.sections.find((s) => sectionKey(s) === search.section) ??
    term.sections.find((s) => s.enrolled > 0) ??
    term.sections[0];

  return (
    <div className="container mx-auto space-y-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Class Roster</h1>
          <p className="text-muted-foreground text-sm">
            {term.sections.length} {term.sections.length === 1 ? "section" : "sections"} in{" "}
            {term.description} {term.year}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 max-md:w-full">
          <Select
            value={termKey(term)}
            // A new term opens its first section, since the old one may not exist in it
            onValueChange={(value) => void navigate({ search: { term: value } })}
          >
            <SelectTrigger className="w-40 max-md:w-full" aria-label="Term">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {terms.map((t) => (
                <SelectItem key={termKey(t)} value={termKey(t)}>
                  {t.description} {t.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sectionKey(section)}
            onValueChange={(value) =>
              void navigate({ search: { term: termKey(term), section: value } })
            }
          >
            <SelectTrigger className="w-72 max-md:w-full" aria-label="Section">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {term.sections.map((s) => (
                <SelectItem key={sectionKey(s)} value={sectionKey(s)}>
                  <span className="font-medium">{sectionKey(s)}</span>
                  <span className="text-muted-foreground truncate">
                    {s.title} · {s.enrolled} enrolled
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Keyed so switching sections starts the search and switches fresh */}
      <SectionRoster
        key={`${termKey(term)}-${sectionKey(section)}`}
        instructorMnumber={instructorMnumber}
        term={term}
        courseId={section.course_id}
        section={section.section}
        title={section.title}
      />
    </div>
  );
}
