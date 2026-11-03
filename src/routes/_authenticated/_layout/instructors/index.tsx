import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "@tanstack/react-db";
import { useState } from "react";
import { PersonStandingIcon, SearchIcon } from "lucide-react";
import { cn } from "cn";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
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
import { formatGpa } from "@/components/instructors/grade-distribution-card";
import { enrollmentQuery } from "@/lib/enrollment";
import type { EnrollmentTerm, InstructorEnrollment } from "@/lib/enrollment";
import { requirePageCapability } from "@/lib/page-guards";

import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { facultyCollection } from "@/integrations/tanstack-db/faculty";
import { termsCollection } from "@/integrations/tanstack-db/terms";

// The term lives in the URL as one value like "2025-80", since the router would quote a lone "80"
type InstructorsSearch = { term?: string };

export const Route = createFileRoute("/_authenticated/_layout/instructors/")({
  beforeLoad: ({ context }) => {
    requirePageCapability(context.userSession, "instructors.view");

    void context.dbClient.collection(facultyCollection).preload();
  },
  validateSearch: (search): InstructorsSearch => ({
    term:
      typeof search.term === "string" && /^\d{4}-\w+$/.test(search.term) ? search.term : undefined,
  }),
  component: InstructorsPage,
  context: () => ({ getTitle: () => "Instructors" }),
});

function termKey(term: EnrollmentTerm) {
  return `${term.year}-${term.term_id}`;
}

function parseTermKey(key?: string): EnrollmentTerm | undefined {
  const match = key ? /^(\d{4})-(\w+)$/.exec(key) : null;
  return match ? { year: Number(match[1]), term_id: match[2] } : undefined;
}

const columns: Array<SortableColumnDef<InstructorEnrollment>> = [
  {
    id: "instructor",
    header: "Instructor",
    accessorFn: (row) => `${row.last_name}, ${row.first_name}`,
    cell: ({ row }) => (
      <div className="whitespace-normal">
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
    accessorFn: (row) => row.gpa ?? undefined,
    cell: ({ row }) => formatGpa(row.original.gpa),
    meta: { numeric: true },
  },
];

function InstructorsPage() {
  const search: InstructorsSearch = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [query, setQuery] = useState("");

  // The same counts as the enrollment page's Instructors tab, so the two always agree
  const enrollment = useQuery({
    ...enrollmentQuery(parseTermKey(search.term)),
    placeholderData: keepPreviousData,
  });

  const { data: termNames } = useLiveQuery({ query: (q) => q.from({ terms: termsCollection }) });
  const { data: faculty } = useLiveQuery({
    query: (q) =>
      q
        .from({ faculty: facultyCollection })
        .orderBy(({ faculty }) => faculty.last_name)
        .orderBy(({ faculty }) => faculty.first_name),
  });
  const { data: departments } = useLiveQuery({
    query: (q) => q.from({ departments: departmentsCollection }),
  });

  if (enrollment.isPending) {
    return (
      <div className="container mx-auto space-y-4 py-6">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (enrollment.isError) {
    return (
      <div className="container mx-auto py-6">
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PersonStandingIcon />
            </EmptyMedia>
            <EmptyTitle>Instructors couldn't load</EmptyTitle>
            <EmptyDescription>{enrollment.error.message}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const data = enrollment.data;
  const term = data.term;
  const termLabel = (t: EnrollmentTerm) =>
    `${termNames.find((name) => name.id === t.term_id)?.description ?? t.term_id} ${t.year}`;

  const text = query.trim().toLowerCase();
  const matches = (first: string, last: string, mnumber: string) =>
    !text || [first, last, `${first} ${last}`, mnumber].some((v) => v.toLowerCase().includes(text));

  const instructors = (data.instructors ?? []).filter((i) =>
    matches(i.first_name, i.last_name, i.mnumber),
  );

  // Anyone else on the faculty, found by searching, since chairs sometimes look up someone outside their courses
  const teaching = new Set((data.instructors ?? []).map((i) => i.mnumber));
  const otherFaculty =
    text.length >= 2
      ? faculty
          .filter((f) => !teaching.has(f.mnumber) && matches(f.first_name, f.last_name, f.mnumber))
          .slice(0, 20)
      : [];
  const departmentName = (id: string | null) =>
    departments.find((d) => d.id === id)?.description ?? "No department";

  const openInstructor = (mnumber: string) =>
    void navigate({
      to: "/instructors/$mnumber",
      params: { mnumber },
      // Open their page on the same term
      search: term ? { from: termKey(term), to: termKey(term) } : {},
    });

  return (
    <div className="container mx-auto space-y-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Instructors</h1>
          <p className="text-muted-foreground text-sm">
            {term
              ? `Everyone teaching your department's courses in ${termLabel(term)}. Counts only those courses and enrolled students. An instructor's own page includes every course they teach.`
              : "Nobody has taught your department's courses yet."}
          </p>
        </div>
        {term && (
          <Select
            value={termKey(term)}
            onValueChange={(value) => void navigate({ search: { term: value } })}
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
        )}
      </div>

      <InputGroup className="w-72 max-md:w-full">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search name or M-Number"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search instructors"
        />
      </InputGroup>

      <Card className={cn("py-0", enrollment.isPlaceholderData && "opacity-60")}>
        <CardContent className="px-0">
          <SortableTable
            columns={columns}
            data={instructors}
            initialSorting={[{ id: "credit_hours", desc: true }]}
            emptyMessage={
              text ? "Nobody teaching this term matches your search." : "Nobody taught this term."
            }
            onRowClick={(instructor) => openInstructor(instructor.mnumber)}
          />
        </CardContent>
      </Card>

      {otherFaculty.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other faculty</CardTitle>
            <CardDescription>
              Matches who didn't teach your department's courses this term.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {otherFaculty.map((f) => (
              <Link
                key={f.mnumber}
                to="/instructors/$mnumber"
                params={{ mnumber: f.mnumber }}
                className="hover:bg-muted -mx-2 flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5"
              >
                <span className="font-medium">
                  {f.first_name} {f.last_name}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {f.mnumber} · {departmentName(f.department_id)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
