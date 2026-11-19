import { Query, eq, useLiveQuery } from "@tanstack/react-db";
import { MailIcon } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GPATrendChart } from "@/components/charts/gpa-trend-chart";
import { useAccessReasons } from "@/hooks/use-access-reasons";
import { ACCESS_REASONS, listAudiences } from "@/lib/access-reasons";
import { useAuthentication } from "@/lib/auth-client";
import { ENROLLED_STATUSES } from "@/lib/enrolled-statuses";
import { academicInfoQuery, gpaHistoryQuery, studentProgramsQuery } from "@/queries/students";
import type { DataRelationship } from "@/types/access-checks";

import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { facultyCollection } from "@/integrations/tanstack-db/faculty";
import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";
import { studentAdvisorsCollection } from "@/integrations/tanstack-db/student-advisors";
import { studentCoursesCollection } from "@/integrations/tanstack-db/student-courses";
import { studentsCollection } from "@/integrations/tanstack-db/students";
import { termsCollection } from "@/integrations/tanstack-db/terms";

export type SheetStudent = { mnumber: string; name: string };

type TermKey = { year: number; term_id: string };

function termOrder(a: TermKey, b: TermKey) {
  return b.year - a.year || b.term_id.localeCompare(a.term_id);
}

function sameTerm(a: TermKey, b: TermKey) {
  return a.year === b.year && a.term_id === b.term_id;
}

function formatGpa(gpa: number | null | undefined) {
  return gpa === null || gpa === undefined ? "—" : gpa.toFixed(2);
}

function formatGrade(grade: string | null, visible: boolean) {
  if (!visible) return "Hidden";
  return grade ?? "—";
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

// Every course the viewer can see the student in, all terms
function studentCoursesQuery(mnumber: string) {
  return new Query()
    .from({ studentCourses: studentCoursesCollection })
    .innerJoin({ courses: coursesCollection }, ({ studentCourses, courses }) =>
      eq(studentCourses.course_id, courses.id),
    )
    .leftJoin({ statuses: registrationStatusCollection }, ({ studentCourses, statuses }) =>
      eq(studentCourses.registration_status_id, statuses.id),
    )
    .leftJoin({ terms: termsCollection }, ({ studentCourses, terms }) =>
      eq(studentCourses.term_id, terms.id),
    )
    .where(({ studentCourses }) => eq(studentCourses.mnumber, mnumber))
    .select(({ studentCourses, courses, statuses, terms }) => ({
      year: studentCourses.year,
      term_id: studentCourses.term_id,
      term_description: terms?.description,
      course_id: studentCourses.course_id,
      section: studentCourses.course_section,
      title: courses.title,
      hours: studentCourses.course_hours,
      instructor_mnumber: studentCourses.instructor_mnumber,
      status_id: studentCourses.registration_status_id,
      status: statuses?.description,
      midterm_grade: studentCourses.midterm_grade,
      final_grade: studentCourses.final_grade,
      grades_visible: studentCourses.grades_visible,
    }));
}

function advisorsQuery(mnumber: string) {
  return new Query()
    .from({ advisors: studentAdvisorsCollection })
    .leftJoin({ faculty: facultyCollection }, ({ advisors, faculty }) =>
      eq(advisors.advisor_mnumber, faculty.mnumber),
    )
    .where(({ advisors }) => eq(advisors.mnumber, mnumber))
    .select(({ advisors, faculty }) => ({
      year: advisors.year,
      term_id: advisors.term_id,
      advisor_mnumber: advisors.advisor_mnumber,
      first_name: faculty?.first_name,
      last_name: faculty?.last_name,
    }));
}

/**
 * Everything the viewer may see about one student, and why they can see them.
 * Every query goes through the same access checks as the rest of the app, so a section the
 * viewer has no access to comes back empty and is left out.
 */
function StudentDetails({ mnumber }: { mnumber: string }) {
  const { userSession, hasCategory } = useAuthentication();
  const access = useAccessReasons();

  const { data: student } = useLiveQuery({
    query: (q) =>
      q
        .from({ students: studentsCollection })
        .where(({ students }) => eq(students.mnumber, mnumber))
        .findOne(),
  });
  const { data: programRows, isLoading: programsLoading } = useLiveQuery({
    query: studentProgramsQuery([mnumber]),
  });
  const { data: infoRows } = useLiveQuery({ query: academicInfoQuery([mnumber]) });
  const { data: history, isLoading: historyLoading } = useLiveQuery({
    query: gpaHistoryQuery(mnumber),
  });
  const { data: advisorRows } = useLiveQuery({ query: advisorsQuery(mnumber) });
  const { data: courseRows, isLoading: coursesLoading } = useLiveQuery({
    query: studentCoursesQuery(mnumber),
  });

  // "Current" means the newest term the viewer can see, the same as Student Lookup
  const newestProgramTerm = [...programRows].sort(termOrder)[0];
  const currentPrograms = newestProgramTerm
    ? programRows.filter((row) => sameTerm(row, newestProgramTerm))
    : [];
  const latestInfo = [...infoRows].sort(termOrder)[0];
  const latestHistory = history.at(-1);
  const currentAdvisor = [...advisorRows].sort(termOrder)[0];

  const reasons = access.reasonsFor({
    mnumber,
    programIds: programRows.map((row) => row.program_id),
    courses: courseRows,
  });
  // GPA, hours and standing come with academic info, which most roles only get for some students.
  // Whether it's this student's is worked out from the same reasons, so an empty GPA section can
  // say "you don't have access" instead of looking like the student has no records yet.
  const academicGrants =
    userSession?.dataGrants.get("academic_info") ?? new Set<DataRelationship>();
  const canSeeGpa = reasons.some((reason) => academicGrants.has(reason));
  const noGpaAccess =
    academicGrants.size === 0
      ? "Your roles don't include access to student GPAs."
      : `You don't have access to this student's GPA. Your roles show GPA only for ${listAudiences(academicGrants)}.`;
  const accessLoading = programsLoading || coursesLoading;
  // The same for advisors, so "—" only ever means the student has no advisor on record
  const advisorGrants = userSession?.dataGrants.get("advisors") ?? new Set<DataRelationship>();
  const canSeeAdvisor = reasons.some((reason) => advisorGrants.has(reason));

  // The specifics behind each reason, like which section the viewer teaches
  const evidence: Partial<Record<DataRelationship, string>> = {
    advises_student: advisorRows.some((row) => row.advisor_mnumber === access.viewer.mnumber)
      ? `Their advisor in ${advisorRows.filter((row) => row.advisor_mnumber === access.viewer.mnumber).length} term(s)`
      : undefined,
    coordinates_program: [
      ...new Set(
        programRows
          .filter(
            (row) =>
              access.lookups.programs.get(row.program_id)?.coordinator === access.viewer.mnumber,
          )
          .map((row) => row.description),
      ),
    ].join(", "),
    teaches_course: [
      ...new Set(
        courseRows
          .filter((row) => row.instructor_mnumber === access.viewer.mnumber)
          .map((row) => `${row.course_id}-${row.section}`),
      ),
    ].join(", "),
    student_in_department: [
      ...new Set(
        programRows
          .filter(
            (row) =>
              access.lookups.programs.get(row.program_id)?.department_id ===
              access.viewer.departmentId,
          )
          .map((row) => row.description),
      ),
    ].join(", "),
    course_in_department: [
      ...new Set(
        courseRows
          .filter(
            (row) =>
              access.lookups.courseDepartments.get(row.course_id) === access.viewer.departmentId,
          )
          .map((row) => row.course_id),
      ),
    ].join(", "),
  };

  // Newest term first, enrolled courses before drops within a term
  const isEnrolled = (statusId: string | null) => ENROLLED_STATUSES.includes(statusId ?? "");
  const terms = [
    ...new Map(courseRows.map((row) => [`${row.year}-${row.term_id}`, row])).values(),
  ].sort(termOrder);
  const showGrades = courseRows.some((row) => row.grades_visible);

  const gpaTrend = history.map((info) => ({
    year_term: `${info.term_description ?? info.term_id} ${info.year}`,
    overall_gpa: info.overall_gpa,
    msu_gpa: info.msu_gpa,
  }));

  return (
    <div className="space-y-6">
      {student?.email && (
        <a
          href={`mailto:${student.email}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
        >
          <MailIcon className="size-4" />
          {student.email}
        </a>
      )}

      <Section title="Why you can see them">
        {programsLoading || coursesLoading ? (
          <Skeleton className="h-16" />
        ) : reasons.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            None of your roles' connections show up in the records you can see, so this is likely
            through a term or record not loaded here.
          </p>
        ) : (
          <ul className="space-y-2">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="shrink-0 font-normal">
                  {ACCESS_REASONS[reason].label}
                </Badge>
                <div>
                  <div>{ACCESS_REASONS[reason].description}</div>
                  {evidence[reason] && (
                    <div className="text-muted-foreground text-xs">{evidence[reason]}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Separator />

      <Section title="Overview">
        {!accessLoading && !canSeeGpa && (
          <p className="text-muted-foreground text-sm">{noGpaAccess}</p>
        )}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {canSeeGpa && (
            <>
              <Fact label="Overall GPA" value={formatGpa(latestInfo?.overall_gpa)} />
              <Fact label="MSU GPA" value={formatGpa(latestHistory?.msu_gpa)} />
              <Fact label="Earned hours" value={latestInfo?.overall_earned_hours ?? "—"} />
              <Fact label="Standing" value={latestInfo?.standing ?? "—"} />
            </>
          )}
          {hasCategory("advisors") && (
            <Fact
              label="Advisor"
              value={
                !canSeeAdvisor
                  ? "No access"
                  : currentAdvisor
                    ? currentAdvisor.last_name
                      ? `${currentAdvisor.first_name} ${currentAdvisor.last_name}`
                      : currentAdvisor.advisor_mnumber
                    : "None on record"
              }
            />
          )}
        </dl>
        {currentPrograms.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {currentPrograms.map((program) => (
              <Badge
                key={`${program.program_id}-${program.type}`}
                variant={program.type === "MAJOR" ? "default" : "secondary"}
              >
                {program.description}
                <span className="opacity-70">{program.type === "MAJOR" ? "Major" : "Minor"}</span>
              </Badge>
            ))}
          </div>
        ) : (
          !programsLoading && (
            <p className="text-muted-foreground text-sm">No declared programs you can see.</p>
          )
        )}
      </Section>

      <Separator />

      <Section title="Courses">
        {coursesLoading ? (
          <Skeleton className="h-32" />
        ) : terms.length === 0 ? (
          <p className="text-muted-foreground text-sm">No courses you can see.</p>
        ) : (
          <div className="space-y-4">
            {terms.map((term) => {
              const label = `${term.term_description ?? term.term_id} ${term.year}`;
              const rows = courseRows
                .filter((row) => sameTerm(row, term))
                .sort(
                  (a, b) =>
                    Number(isEnrolled(b.status_id)) - Number(isEnrolled(a.status_id)) ||
                    a.course_id.localeCompare(b.course_id),
                );
              return (
                <div key={label} className="rounded-md border">
                  <Table>
                    <TableCaption className="sr-only">{`${label} courses`}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{label}</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        {showGrades && <TableHead>Midterm</TableHead>}
                        {showGrades && <TableHead>Final</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((course) => {
                        const enrolled = isEnrolled(course.status_id);
                        return (
                          <TableRow
                            key={`${course.course_id}-${course.section}`}
                            className={cn(!enrolled && "bg-muted/50 opacity-55")}
                          >
                            <TableCell className="whitespace-normal">
                              <div className="font-medium">
                                {course.course_id}
                                <span className="text-muted-foreground font-normal">
                                  {" "}
                                  · {course.section}
                                </span>
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {course.title}
                                {!enrolled && course.status && ` · ${course.status}`}
                              </div>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {course.hours}
                            </TableCell>
                            {showGrades && (
                              <TableCell>
                                {formatGrade(course.midterm_grade, course.grades_visible)}
                              </TableCell>
                            )}
                            {showGrades && (
                              <TableCell>
                                {formatGrade(course.final_grade, course.grades_visible)}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Separator />
      <Section title="GPA by term">
        {historyLoading || accessLoading ? (
          <Skeleton className="h-56" />
        ) : !canSeeGpa ? (
          <p className="text-muted-foreground text-sm">{noGpaAccess}</p>
        ) : gpaTrend.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No GPA has been recorded for this student yet.
          </p>
        ) : gpaTrend.length === 1 ? (
          <p className="text-muted-foreground text-sm">
            Only one term of GPA so far ({gpaTrend[0].year_term}). The trend shows up after their
            second term.
          </p>
        ) : (
          <GPATrendChart gpaTrend={gpaTrend} />
        )}
      </Section>
    </div>
  );
}

/**
 * A side sheet for one student, opened by clicking their name in a table.
 */
export function StudentSheet({
  student,
  onClose,
}: {
  student: SheetStudent | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!student} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-background gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        {student && (
          <>
            <SheetHeader className="pr-12">
              <SheetTitle>{student.name}</SheetTitle>
              <SheetDescription>{student.mnumber}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-auto px-4 pb-6">
              {/* Keyed so switching students starts each one's queries fresh */}
              <StudentDetails key={student.mnumber} mnumber={student.mnumber} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
