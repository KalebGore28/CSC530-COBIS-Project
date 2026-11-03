import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "@tanstack/react-db";
import { DownloadIcon, SearchXIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MultiPicker } from "@/components/student-lookup/multi-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthentication } from "@/lib/auth-client";
import { requirePageCapability } from "@/lib/page-guards";
import { lookupParams, studentLookupQuery } from "@/lib/student-lookup";
import type {
  ClassLevel,
  LetterGrade,
  LookupStudent,
  StudentLookupSearch,
} from "@/lib/student-lookup";

import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { programsCollection } from "@/integrations/tanstack-db/programs";

const CLASS_LEVELS: Array<ClassLevel> = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const MIN_GRADES: Array<LetterGrade> = ["A", "B", "C", "D"];
const GPA_MINIMUMS = [2, 2.5, 3, 3.5];

function stringList(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? (value as Array<string>)
    : undefined;
}

export const Route = createFileRoute("/_authenticated/_layout/student-lookup")({
  beforeLoad: ({ context }) => {
    requirePageCapability(context.userSession, "student.lookup");

    const dbClient = context.dbClient;
    void dbClient.collection(programsCollection).preload();
    void dbClient.collection(coursesCollection).preload();
  },
  // The filters live in the URL, so a search can be bookmarked or shared
  validateSearch: (search): StudentLookupSearch => {
    const gpaMin = Number(search.gpaMin);
    const page = Number(search.page);
    return {
      program: stringList(search.program),
      programType:
        search.programType === "major" || search.programType === "minor"
          ? search.programType
          : undefined,
      course: stringList(search.course),
      notTaken: search.notTaken === true ? true : undefined,
      minGrade: MIN_GRADES.find((grade) => grade === search.minGrade),
      level: stringList(search.level)?.filter((level): level is ClassLevel =>
        CLASS_LEVELS.includes(level as ClassLevel),
      ),
      gpaMin: GPA_MINIMUMS.includes(gpaMin) ? gpaMin : undefined,
      sort: search.sort === "gpa" ? "gpa" : undefined,
      page: Number.isInteger(page) && page > 1 ? page : undefined,
    };
  },
  component: StudentLookup,
  context: () => ({ getTitle: () => "Student Lookup" }),
});

function fullName(student: LookupStudent) {
  return `${student.first_name} ${student.last_name}${student.suffix ? ` ${student.suffix}` : ""}`;
}

// A few students list many programs, so only the first is spelled out
function ProgramSummary({ student }: { student: LookupStudent }) {
  const [first, ...rest] = student.programs;
  if (!first) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="max-w-56 whitespace-normal">
      <div>{first.description}</div>
      <div className="text-muted-foreground text-xs">
        {first.type === "MAJOR" ? "Major" : "Minor"}
        {rest.length > 0 && ` · ${rest.length} more`}
      </div>
    </div>
  );
}

function StudentLookup() {
  const search: StudentLookupSearch = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { hasCategory } = useAuthentication();
  // Admin assistants can't see GPA, standing or grades, so those filters and columns are left out for them
  const canSeeAcademicInfo = hasCategory("academic_info");
  const canSeeGrades = hasCategory("grades");

  const { data: programs } = useLiveQuery({
    query: (q) =>
      q.from({ programs: programsCollection }).orderBy(({ programs }) => programs.description),
  });
  const { data: courses } = useLiveQuery({
    query: (q) => q.from({ courses: coursesCollection }).orderBy(({ courses }) => courses.id),
  });

  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useQuery({ ...studentLookupQuery(search), placeholderData: keepPreviousData });

  // Any filter change goes back to the first page, since the old page may not exist anymore
  const setFilters = (changes: Partial<StudentLookupSearch>) =>
    void navigate({ search: (prev) => ({ ...prev, ...changes, page: undefined }) });

  const programNames = new Map(programs.map((program) => [program.id, program.description]));
  const courseTitles = new Map(courses.map((course) => [course.id, course.title]));
  const pickedPrograms = search.program ?? [];
  const pickedCourses = search.course ?? [];
  const hasFilters =
    pickedPrograms.length > 0 ||
    pickedCourses.length > 0 ||
    (search.level?.length ?? 0) > 0 ||
    search.gpaMin !== undefined;

  // Each kind of filter counts once, for the badge on the phone Filters button
  const activeFilters = [
    pickedPrograms.length > 0,
    pickedCourses.length > 0,
    search.gpaMin !== undefined,
    (search.level?.length ?? 0) > 0,
  ].filter(Boolean).length;

  const page = search.page ?? 1;
  const data = results.data;
  const firstShown = data ? (data.page - 1) * data.pageSize + 1 : 0;
  const lastShown = data ? firstShown + data.students.length - 1 : 0;
  const lastPage = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const filterControls = (
    <>
      <MultiPicker
        label="Programs"
        options={programs.map((program) => ({
          value: program.id,
          label: program.description,
          detail: program.id,
        }))}
        selected={pickedPrograms}
        onChange={(program) => setFilters({ program: program.length ? program : undefined })}
        searchPlaceholder="Search programs..."
        emptyMessage="No programs found."
      />
      {pickedPrograms.length > 0 && (
        <Select
          value={search.programType ?? "any"}
          onValueChange={(value) =>
            setFilters({
              programType: value === "any" ? undefined : (value as "major" | "minor"),
            })
          }
        >
          <SelectTrigger className="w-36 max-md:w-full" aria-label="Major or minor">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Major or minor</SelectItem>
            <SelectItem value="major">Major</SelectItem>
            <SelectItem value="minor">Minor</SelectItem>
          </SelectContent>
        </Select>
      )}

      <MultiPicker
        label="Courses"
        options={courses.map((course) => ({
          value: course.id,
          label: course.id,
          detail: course.title,
        }))}
        selected={pickedCourses}
        onChange={(course) => setFilters({ course: course.length ? course : undefined })}
        searchPlaceholder="Search courses..."
        emptyMessage="No courses found."
      />
      {pickedCourses.length > 0 && (
        <>
          <Select
            value={search.notTaken ? "not_taken" : "taken"}
            onValueChange={(value) =>
              setFilters({
                notTaken: value === "not_taken" ? true : undefined,
                // A minimum grade only means something for students who took the course
                minGrade: value === "not_taken" ? undefined : search.minGrade,
              })
            }
          >
            <SelectTrigger className="w-36 max-md:w-full" aria-label="Taken or not taken">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="taken">Has taken</SelectItem>
              <SelectItem value="not_taken">Hasn't taken</SelectItem>
            </SelectContent>
          </Select>
          {canSeeGrades && !search.notTaken && (
            <Select
              value={search.minGrade ?? "any"}
              onValueChange={(value) =>
                setFilters({ minGrade: value === "any" ? undefined : (value as LetterGrade) })
              }
            >
              <SelectTrigger className="w-36 max-md:w-full" aria-label="Minimum grade">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any grade</SelectItem>
                {MIN_GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade === "A" ? "A" : `${grade} or better`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </>
      )}

      {canSeeAcademicInfo && (
        <Select
          value={search.gpaMin !== undefined ? String(search.gpaMin) : "any"}
          onValueChange={(value) =>
            setFilters({ gpaMin: value === "any" ? undefined : Number(value) })
          }
        >
          <SelectTrigger className="w-36 max-md:w-full" aria-label="Minimum GPA">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any GPA</SelectItem>
            {GPA_MINIMUMS.map((gpa) => (
              <SelectItem key={gpa} value={String(gpa)}>
                GPA {gpa.toFixed(1)}+
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {canSeeAcademicInfo && (
        <ToggleGroup
          type="multiple"
          variant="outline"
          value={search.level ?? []}
          onValueChange={(level) =>
            setFilters({ level: level.length ? (level as Array<ClassLevel>) : undefined })
          }
          className="flex-wrap"
          aria-label="Class level"
        >
          {CLASS_LEVELS.map((level) => (
            <ToggleGroupItem
              key={level}
              value={level}
              // The toggle's own "on" style matches its hover, so a picked level is filled in to stand out
              className="data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90 h-(--control-height)"
            >
              {level}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </>
  );

  return (
    <div className="container mx-auto space-y-4 py-6">
      <div>
        <h1 className="text-xl font-semibold">Student Lookup</h1>
        <p className="text-muted-foreground text-sm">
          Students in your department. A student has to match every filter, and any of the programs
          or courses picked.
        </p>
      </div>

      {isMobile ? (
        // On phones the filters would push the results off screen, so they open in a sheet
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <div className="flex gap-2">
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1">
                <SlidersHorizontalIcon />
                Filters
                {activeFilters > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-xs tabular-nums">
                    {activeFilters}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            {hasFilters && (
              <Button variant="ghost" onClick={() => void navigate({ search: {} })}>
                Clear
              </Button>
            )}
          </div>
          <SheetContent side="bottom" className="bg-background max-h-[85svh] gap-0">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Results update as you change them.</SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-4 pb-2">
              {filterControls}
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button>
                  Show {data ? data.total.toLocaleString() : ""}{" "}
                  {data?.total === 1 ? "student" : "students"}
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {filterControls}
          {hasFilters && (
            <Button variant="ghost" onClick={() => void navigate({ search: {} })}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* What's picked, so it's visible without opening the pickers */}
      {(pickedPrograms.length > 0 || pickedCourses.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {pickedPrograms.map((id) => (
            <Badge key={`program-${id}`} variant="secondary" className="gap-1 pr-1">
              {programNames.get(id) ?? id}
              <button
                type="button"
                aria-label={`Remove ${programNames.get(id) ?? id}`}
                className="hover:bg-background/60 rounded-full p-0.5"
                onClick={() => {
                  const program = pickedPrograms.filter((p) => p !== id);
                  setFilters({ program: program.length ? program : undefined });
                }}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          {pickedCourses.map((id) => (
            <Badge
              key={`course-${id}`}
              variant="secondary"
              className="gap-1 pr-1"
              title={courseTitles.get(id)}
            >
              {id}
              <button
                type="button"
                aria-label={`Remove ${id}`}
                className="hover:bg-background/60 rounded-full p-0.5"
                onClick={() => {
                  const course = pickedCourses.filter((c) => c !== id);
                  setFilters({ course: course.length ? course : undefined });
                }}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {results.isPending ? (
        <Skeleton className="h-96" />
      ) : results.isError ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>The search couldn't run</EmptyTitle>
            <EmptyDescription>{results.error.message}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card className={cn("gap-0 py-0", results.isPlaceholderData && "opacity-60")}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b p-(--card-padding)">
            <span className="text-sm font-medium">
              {data?.total.toLocaleString()} {data?.total === 1 ? "student" : "students"}
            </span>
            <div className="flex flex-wrap gap-2 max-md:w-full">
              {canSeeAcademicInfo && (
                <Select
                  value={search.sort ?? "name"}
                  onValueChange={(value) =>
                    void navigate({
                      search: (prev) => ({
                        ...prev,
                        sort: value === "gpa" ? "gpa" : undefined,
                        page: undefined,
                      }),
                    })
                  }
                >
                  <SelectTrigger className="w-40 max-md:flex-1" aria-label="Sort by">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by name</SelectItem>
                    <SelectItem value="gpa">Sort by GPA</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {/* The server builds the file from every match, not just this page */}
              <Button variant="outline" asChild className="max-md:flex-1">
                <a
                  href={`/api/lookup-students?${lookupParams({ ...search, page: undefined }).toString()}&format=csv`}
                  download
                >
                  <DownloadIcon />
                  Export CSV
                </a>
              </Button>
            </div>
          </div>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="max-md:hidden">Programs</TableHead>
                  {canSeeAcademicInfo && <TableHead className="max-md:hidden">Level</TableHead>}
                  {canSeeAcademicInfo && <TableHead className="text-right">GPA</TableHead>}
                  <TableHead className="max-md:hidden">Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.students.length ? (
                  data.students.map((student) => (
                    <TableRow key={student.mnumber}>
                      <TableCell className="whitespace-normal">
                        <div className="font-medium">{fullName(student)}</div>
                        <div className="text-muted-foreground text-xs">{student.mnumber}</div>
                      </TableCell>
                      <TableCell className="max-md:hidden">
                        <ProgramSummary student={student} />
                      </TableCell>
                      {canSeeAcademicInfo && (
                        <TableCell className="max-md:hidden">
                          {student.class_level ?? "—"}
                        </TableCell>
                      )}
                      {canSeeAcademicInfo && (
                        <TableCell className="text-right tabular-nums">
                          {student.overall_gpa?.toFixed(2) ?? "—"}
                        </TableCell>
                      )}
                      <TableCell className="max-md:hidden">
                        {student.email && (
                          <a href={`mailto:${student.email}`} className="hover:underline">
                            {student.email}
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                      No students match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          {data && data.total > data.pageSize && (
            <div className="flex items-center justify-between gap-2 border-t p-(--card-padding)">
              <span className="text-muted-foreground text-sm tabular-nums">
                {firstShown}–{lastShown} of {data.total.toLocaleString()}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() =>
                    void navigate({
                      search: (prev) => ({ ...prev, page: page - 1 > 1 ? page - 1 : undefined }),
                    })
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= lastPage}
                  onClick={() => void navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
