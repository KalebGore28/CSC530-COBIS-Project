import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { ArrowLeftIcon, MailIcon, PersonStandingIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { SortableTable } from "@/components/tables/sortable-table";
import type { SortableColumnDef } from "@/components/tables/sortable-table";
import {
  GradeDistributionCard,
  formatGpa,
  formatRate,
} from "@/components/instructors/grade-distribution-card";
import { useInstructorTeaching } from "@/hooks/use-instructor-teaching";
import type { TaughtSection, TaughtTerm } from "@/hooks/use-instructor-teaching";
import { useAuthentication } from "@/lib/auth-client";
import { requirePageCapability } from "@/lib/page-guards";

import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { facultyCollection } from "@/integrations/tanstack-db/faculty";
import { usersCollection } from "@/integrations/tanstack-db/users";

// The range lives in the URL, as one value per end like "2025-80", since the router would quote a lone "80"
type InstructorSearch = {
  from?: string;
  to?: string;
};

export const Route = createFileRoute("/_authenticated/_layout/instructors/$mnumber/")({
  beforeLoad: ({ context, params }) => {
    // Faculty can always see their own teaching (story 3), and chairs can see anyone's
    if (context.userSession?.user.mnumber !== params.mnumber) {
      requirePageCapability(context.userSession, "instructors.view");
    }

    const dbClient = context.dbClient;
    void dbClient.collection(facultyCollection).preload();
    void dbClient.collection(usersCollection).preload();
  },
  validateSearch: (search): InstructorSearch => ({
    from: typeof search.from === "string" ? search.from : undefined,
    to: typeof search.to === "string" ? search.to : undefined,
  }),
  component: InstructorPage,
  context: () => ({ getTitle: () => "Instructor" }),
});

function termKey(term: { year: number; term_id: string }) {
  return `${term.year}-${term.term_id}`;
}

function termLabel(term: TaughtTerm) {
  return `${term.description} ${term.year}`;
}

function SummaryTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="gap-1 py-(--card-padding)">
      <CardHeader className="px-(--card-padding)">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground px-(--card-padding) text-xs">
        {detail}
      </CardContent>
    </Card>
  );
}

const sectionColumns: Array<SortableColumnDef<TaughtSection>> = [
  {
    id: "term",
    header: "Term",
    // Newest first when sorted descending
    accessorFn: (row) => termKey(row),
    cell: ({ row }) => termLabel(row.original),
    meta: { hideOnMobile: true },
  },
  {
    id: "section",
    header: "Section",
    accessorFn: (row) => `${row.course_id}-${row.section}`,
    cell: ({ row }) => (
      <div className="whitespace-normal md:min-w-40">
        <div className="font-medium">
          {row.original.course_id}-{row.original.section}
        </div>
        <div className="text-muted-foreground text-xs">{row.original.title}</div>
        {/* The term column is hidden on phones, so the term sits under the title there */}
        <div className="text-muted-foreground text-xs md:hidden">{termLabel(row.original)}</div>
      </div>
    ),
  },
  {
    id: "enrolled",
    header: "Enrolled",
    accessorFn: (row) => row.grades.enrolled,
    meta: { numeric: true },
  },
  {
    id: "credit_hours",
    header: "Credit hours",
    accessorFn: (row) => row.credit_hours,
    meta: { numeric: true, hideOnMobile: true },
  },
  {
    id: "gpa",
    header: "GPA",
    accessorFn: (row) => row.grades.gpa ?? undefined,
    cell: ({ row }) => formatGpa(row.original.grades.gpa),
    meta: { numeric: true },
  },
  {
    id: "dfw",
    header: "DFW",
    accessorFn: (row) => row.grades.dfw_rate ?? undefined,
    cell: ({ row }) => formatRate(row.original.grades.dfw_rate),
    meta: { numeric: true, hideOnMobile: true },
  },
];

function InstructorPage() {
  const { mnumber } = Route.useParams();
  const search: InstructorSearch = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { can } = useAuthentication();

  const { data: instructor, isLoading: instructorLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ faculty: facultyCollection })
        .leftJoin({ departments: departmentsCollection }, ({ faculty, departments }) =>
          eq(faculty.department_id, departments.id),
        )
        .leftJoin({ users: usersCollection }, ({ faculty, users }) =>
          eq(faculty.mnumber, users.mnumber),
        )
        .where(({ faculty }) => eq(faculty.mnumber, mnumber))
        .select(({ faculty, departments, users }) => ({
          first_name: faculty.first_name,
          last_name: faculty.last_name,
          department: departments?.description,
          email: users?.email,
        }))
        .findOne(),
  });

  const teaching = useInstructorTeaching(mnumber, search.from, search.to);

  if (instructorLoading || teaching.isLoading) {
    return (
      <div className="container mx-auto space-y-4 py-6">
        <Skeleton className="h-16 w-96" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const backLink = can("instructors.view") && (
    <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
      <Link to="/instructors">
        <ArrowLeftIcon />
        Instructors
      </Link>
    </Button>
  );

  if (!instructor) {
    return (
      <div className="container mx-auto space-y-4 py-6">
        {backLink}
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PersonStandingIcon />
            </EmptyMedia>
            <EmptyTitle>Instructor not found</EmptyTitle>
            <EmptyDescription>There's no faculty record for {mnumber}.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const { range, summary } = teaching;
  // Oldest first in the pickers, so "From" reads naturally
  const pickerTerms = [...teaching.terms].reverse();
  const finished = summary.grades.graded + summary.grades.withdrawn;

  return (
    <div className="container mx-auto space-y-4 py-6">
      {backLink}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            {instructor.first_name} {instructor.last_name}
          </h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 text-sm">
            <span>{instructor.department ?? "No department"}</span>
            {instructor.email && (
              <a
                href={`mailto:${instructor.email}`}
                className="hover:text-foreground inline-flex items-center gap-1"
              >
                <MailIcon className="size-3.5" />
                {instructor.email}
              </a>
            )}
          </div>
          {/* The instructors list only counts the viewer's department, so the difference is spelled out here */}
          <p className="text-muted-foreground mt-1 text-xs">
            Includes every course they teach, in any department.
          </p>
        </div>

        {range && (
          <div className="flex flex-wrap items-center gap-2 max-md:w-full">
            <Select
              value={termKey(range.from)}
              onValueChange={(value) =>
                void navigate({ search: { from: value, to: termKey(range.to) } })
              }
            >
              <SelectTrigger className="w-40 max-md:flex-1" aria-label="From term">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pickerTerms.map((term) => (
                  <SelectItem key={termKey(term)} value={termKey(term)}>
                    {termLabel(term)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground text-sm">to</span>
            <Select
              value={termKey(range.to)}
              onValueChange={(value) =>
                void navigate({ search: { from: termKey(range.from), to: value } })
              }
            >
              <SelectTrigger className="w-40 max-md:flex-1" aria-label="To term">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pickerTerms.map((term) => (
                  <SelectItem key={termKey(term)} value={termKey(term)}>
                    {termLabel(term)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!range ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PersonStandingIcon />
            </EmptyMedia>
            <EmptyTitle>No classes yet</EmptyTitle>
            <EmptyDescription>
              {instructor.first_name} isn't listed as the instructor for any courses.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <SummaryTile
              label="Sections"
              value={summary.sections.toLocaleString()}
              detail={
                termKey(range.from) === termKey(range.to)
                  ? termLabel(range.from)
                  : `${termLabel(range.from)} to ${termLabel(range.to)}`
              }
            />
            <SummaryTile
              label="Students"
              value={summary.students.toLocaleString()}
              detail="Different students enrolled"
            />
            <SummaryTile
              label="Credit hours"
              value={summary.credit_hours.toLocaleString()}
              detail="Generated by enrolled students"
            />
            <SummaryTile
              label="GPA"
              value={formatGpa(summary.grades.gpa)}
              detail={`From ${summary.grades.graded.toLocaleString()} final grades`}
            />
            <SummaryTile
              label="DFW rate"
              value={formatRate(summary.grades.dfw_rate)}
              detail={`D, E or W, of ${finished.toLocaleString()} finished`}
            />
          </div>

          <GradeDistributionCard
            overall={summary.grades}
            byTerm={teaching.byTerm}
            byCourse={teaching.byCourse}
          />

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-(--card-padding)">
              <CardTitle>Sections taught</CardTitle>
              <CardDescription>
                Enrolled students only. GPA and DFW use final grades that are in. Open a section to
                see its roster.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <SortableTable
                columns={sectionColumns}
                data={teaching.sections}
                initialSorting={[{ id: "term", desc: true }]}
                emptyMessage="No sections in these terms."
                onRowClick={(section) =>
                  void navigate({
                    to: "/instructors/$mnumber/roster",
                    params: { mnumber },
                    search: {
                      term: termKey(section),
                      section: `${section.course_id}-${section.section}`,
                    },
                  })
                }
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
