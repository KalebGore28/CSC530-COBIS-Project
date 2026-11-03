import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { ChartColumnIncreasingIcon } from "lucide-react";
import { cn } from "cn";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrollmentTable } from "@/components/enrollment/enrollment-table";
import type { EnrollmentColumnDef } from "@/components/enrollment/enrollment-table";
import { useAuthentication } from "@/lib/auth-client";
import { enrollmentQuery, previousYearTerm } from "@/lib/enrollment";
import type {
  CourseEnrollment,
  EnrollmentResponse,
  EnrollmentTerm,
  InstructorEnrollment,
  ProgramEnrollment,
} from "@/lib/enrollment";

import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { termsCollection } from "@/integrations/tanstack-db/terms";

const TABS = ["programs", "courses", "instructors"] as const;
type EnrollmentTab = (typeof TABS)[number];

// The term and tab live in the URL, so a link opens the same view.
// The term is one value like "2025-80", since the router would quote a term_id like "80" on its own.
type EnrollmentSearch = {
  term?: string;
  tab?: EnrollmentTab;
};

export const Route = createFileRoute("/_authenticated/_layout/enrollment/")({
  validateSearch: (search): EnrollmentSearch => ({
    term: typeof search.term === "string" && parseTermKey(search.term) ? search.term : undefined,
    tab: TABS.find((tab) => tab === search.tab),
  }),
  component: RouteComponent,
  context: () => ({ getTitle: () => "Enrollment" }),
});

// Each row carries last year's number, or undefined when there's nothing to compare against
type WithPrevious<TRow> = TRow & { previous?: number };

function termKey(term: EnrollmentTerm) {
  return `${term.year}-${term.term_id}`;
}

function parseTermKey(key: string): EnrollmentTerm | undefined {
  const match = /^(\d{4})-(\w+)$/.exec(key);
  return match ? { year: Number(match[1]), term_id: match[2] } : undefined;
}

function hasTerm(terms: Array<EnrollmentTerm>, term: EnrollmentTerm) {
  return terms.some((t) => termKey(t) === termKey(term));
}

function formatChange(current: number, previous: number | undefined) {
  if (previous === undefined) return "—";
  const change = current - previous;
  if (change === 0) return "0";
  // A real minus sign, which lines up with the plus sign
  return change > 0 ? `+${change.toLocaleString()}` : `−${Math.abs(change).toLocaleString()}`;
}

function Change({ current, previous }: { current: number; previous: number | undefined }) {
  return <span className="text-muted-foreground">{formatChange(current, previous)}</span>;
}

const programColumns: Array<EnrollmentColumnDef<WithPrevious<ProgramEnrollment>>> = [
  {
    id: "program",
    header: "Program",
    accessorFn: (row) => row.description,
    cell: ({ row }) => (
      <div className="whitespace-normal md:min-w-40">
        <div className="font-medium">{row.original.description}</div>
        <div className="text-muted-foreground text-xs">{row.original.program_id}</div>
      </div>
    ),
  },
  {
    id: "majors",
    header: "Majors",
    accessorFn: (row) => row.majors,
    meta: { numeric: true },
  },
  {
    id: "change",
    header: "Change",
    accessorFn: (row) => (row.previous === undefined ? undefined : row.majors - row.previous),
    cell: ({ row }) => <Change current={row.original.majors} previous={row.original.previous} />,
    meta: { numeric: true },
  },
  {
    id: "minors",
    header: "Minors",
    accessorFn: (row) => row.minors,
    meta: { numeric: true },
  },
];

const courseColumns: Array<EnrollmentColumnDef<WithPrevious<CourseEnrollment>>> = [
  {
    id: "course",
    header: "Course",
    accessorFn: (row) => row.course_id,
    cell: ({ row }) => (
      <div className="whitespace-normal md:min-w-40">
        <div className="font-medium">{row.original.course_id}</div>
        <div className="text-muted-foreground text-xs">{row.original.title}</div>
      </div>
    ),
  },
  {
    id: "sections",
    header: "Sections",
    accessorFn: (row) => row.sections,
    meta: { numeric: true, hideOnMobile: true },
  },
  {
    id: "enrolled",
    header: "Enrolled",
    accessorFn: (row) => row.enrolled,
    meta: { numeric: true },
  },
  {
    id: "change",
    header: "Change",
    accessorFn: (row) => (row.previous === undefined ? undefined : row.enrolled - row.previous),
    cell: ({ row }) => <Change current={row.original.enrolled} previous={row.original.previous} />,
    meta: { numeric: true },
  },
  {
    id: "credit_hours",
    header: "Credit hours",
    accessorFn: (row) => row.credit_hours,
    meta: { numeric: true, hideOnMobile: true },
  },
];

const instructorColumns: Array<EnrollmentColumnDef<WithPrevious<InstructorEnrollment>>> = [
  {
    id: "instructor",
    header: "Instructor",
    accessorFn: (row) => `${row.last_name}, ${row.first_name}`,
    cell: ({ row }) => (
      <div className="whitespace-normal md:min-w-40">
        <div className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </div>
        <div className="text-muted-foreground text-xs">{row.original.mnumber}</div>
      </div>
    ),
  },
  {
    id: "sections",
    header: "Sections",
    accessorFn: (row) => row.sections,
    meta: { numeric: true, hideOnMobile: true },
  },
  {
    id: "enrolled",
    header: "Enrolled",
    accessorFn: (row) => row.enrolled,
    meta: { numeric: true, hideOnMobile: true },
  },
  {
    id: "credit_hours",
    header: "Credit hours",
    accessorFn: (row) => row.credit_hours,
    meta: { numeric: true },
  },
  {
    id: "change",
    header: "Change",
    accessorFn: (row) => (row.previous === undefined ? undefined : row.credit_hours - row.previous),
    cell: ({ row }) => (
      <Change current={row.original.credit_hours} previous={row.original.previous} />
    ),
    meta: { numeric: true },
  },
];

function SummaryTile({
  label,
  value,
  previous,
}: {
  label: string;
  value: number;
  previous: number | undefined;
}) {
  return (
    <Card className="gap-1 py-(--card-padding)">
      <CardHeader className="px-(--card-padding)">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value.toLocaleString()}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground px-(--card-padding) text-xs">
        {previous === undefined
          ? "Nothing to compare with"
          : `${formatChange(value, previous)} from last year`}
      </CardContent>
    </Card>
  );
}

function EnrollmentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

function EnrollmentMessage({ title, description }: { title: string; description: string }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ChartColumnIncreasingIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function RouteComponent() {
  const search: EnrollmentSearch = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { userSession } = useAuthentication();
  const departmentId = userSession?.faculty.department_id ?? "";

  const requestedTerm = search.term ? parseTermKey(search.term) : undefined;

  // Keeps the last term's numbers on screen while the next one loads
  const current = useQuery({
    ...enrollmentQuery(requestedTerm),
    placeholderData: keepPreviousData,
  });
  const term = current.data?.term ?? null;
  const previousTerm = term ? previousYearTerm(term) : null;
  const canCompare = !!previousTerm && !!current.data && hasTerm(current.data.terms, previousTerm);
  const previous = useQuery({
    ...enrollmentQuery(previousTerm ?? undefined),
    enabled: canCompare,
  });

  const { data: termNames } = useLiveQuery((q) => q.from({ terms: termsCollection }));
  const { data: department } = useLiveQuery(
    (q) =>
      q
        .from({ departments: departmentsCollection })
        .where(({ departments }) => eq(departments.id, departmentId))
        .findOne(),
    [departmentId],
  );

  const termLabel = (t: EnrollmentTerm) =>
    `${termNames.find((name) => name.id === t.term_id)?.description ?? t.term_id} ${t.year}`;

  const tab = search.tab ?? "programs";

  if (current.isPending) return <EnrollmentSkeleton />;

  if (current.isError) {
    return (
      <EnrollmentMessage title="Enrollment couldn't load" description={current.error.message} />
    );
  }

  const data: EnrollmentResponse = current.data;

  if (!term || !data.summary) {
    return (
      <EnrollmentMessage
        title="No enrollments yet"
        description="Enrollment shows up here once course registrations for your department are imported."
      />
    );
  }

  // Last year's numbers only count once they've loaded, so the change column doesn't flash zeros
  const comparison = canCompare && previous.data?.summary ? previous.data : undefined;
  const previousMajors = new Map(comparison?.programs?.map((p) => [p.program_id, p.majors]));
  const previousEnrolled = new Map(comparison?.courses?.map((c) => [c.course_id, c.enrolled]));
  const previousCreditHours = new Map(
    comparison?.instructors?.map((i) => [i.mnumber, i.credit_hours]),
  );

  // Something new this term had nothing last year, which is a real 0 rather than unknown
  const programs = (data.programs ?? []).map((p) => ({
    ...p,
    previous: comparison ? (previousMajors.get(p.program_id) ?? 0) : undefined,
  }));
  const courses = (data.courses ?? []).map((c) => ({
    ...c,
    previous: comparison ? (previousEnrolled.get(c.course_id) ?? 0) : undefined,
  }));
  const instructors = (data.instructors ?? []).map((i) => ({
    ...i,
    previous: comparison ? (previousCreditHours.get(i.mnumber) ?? 0) : undefined,
  }));

  const comparedWith =
    comparison && previousTerm ? `Compared with ${termLabel(previousTerm)}.` : "";

  return (
    <div className={cn("space-y-4", current.isPlaceholderData && "opacity-60")}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{department?.description ?? departmentId}</h1>
          <p className="text-muted-foreground text-sm">
            Enrolled students only, not drops or withdrawals. {comparedWith}
          </p>
        </div>
        <Select
          value={termKey(term)}
          onValueChange={(value) => {
            void navigate({ search: (prev) => ({ ...prev, term: value }) });
          }}
        >
          <SelectTrigger className="w-44 max-md:w-full" aria-label="Term">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {data.terms.map((t) => (
              <SelectItem key={termKey(t)} value={termKey(t)}>
                {termLabel(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryTile
          label="Students"
          value={data.summary.students}
          previous={comparison?.summary?.students}
        />
        <SummaryTile
          label="Credit hours"
          value={data.summary.credit_hours}
          previous={comparison?.summary?.credit_hours}
        />
        <SummaryTile
          label="Sections"
          value={data.summary.sections}
          previous={comparison?.summary?.sections}
        />
        <SummaryTile
          label="Majors"
          value={data.summary.majors}
          previous={comparison?.summary?.majors}
        />
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) =>
          void navigate({ search: (prev) => ({ ...prev, tab: value as EnrollmentTab }) })
        }
      >
        <TabsList variant="line" className="max-md:w-full">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
        </TabsList>

        <Card className="py-0">
          <CardContent className="px-0">
            <TabsContent value="programs">
              <EnrollmentTable
                columns={programColumns}
                data={programs}
                initialSorting={[{ id: "majors", desc: true }]}
                emptyMessage="No students in your department's programs this term."
              />
            </TabsContent>
            <TabsContent value="courses">
              <EnrollmentTable
                columns={courseColumns}
                data={courses}
                initialSorting={[{ id: "enrolled", desc: true }]}
                emptyMessage="None of your department's courses had students this term."
              />
            </TabsContent>
            <TabsContent value="instructors">
              <EnrollmentTable
                columns={instructorColumns}
                data={instructors}
                initialSorting={[{ id: "credit_hours", desc: true }]}
                emptyMessage="No one taught your department's courses this term."
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
