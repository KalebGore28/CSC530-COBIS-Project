import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { MailIcon } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GPATrendChart } from "@/components/charts/gpa-trend-chart";
import { AttentionBadges } from "@/components/advisees/attention-badges";
import type { Advisee } from "@/hooks/use-advisees";
import { ENROLLED_STATUSES } from "@/lib/enrolled-statuses";

import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";
import { studentAcademicInfoCollection } from "@/integrations/tanstack-db/student-academic-info";
import { studentCoursesCollection } from "@/integrations/tanstack-db/student-courses";
import { termsCollection } from "@/integrations/tanstack-db/terms";

type Term = { year: number; term_id: string; description: string };

function formatGpa(gpa: number | null | undefined) {
  return gpa === null || gpa === undefined ? "—" : gpa.toFixed(2);
}

// A hidden grade and one that hasn't been entered are both null, so grades_visible tells them apart
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

/**
 * Everything about one advisee: overview, this term's courses, and how their GPA has gone.
 * The list row already has the overview, so only the courses and GPA history are loaded here.
 */
export function AdviseePanel({ advisee, term }: { advisee: Advisee; term: Term }) {
  const { data: history, isLoading: historyLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ info: studentAcademicInfoCollection })
        .leftJoin({ terms: termsCollection }, ({ info, terms }) => eq(info.term_id, terms.id))
        .where(({ info }) => eq(info.mnumber, advisee.mnumber))
        .orderBy(({ info }) => info.year, "asc")
        .orderBy(({ info }) => info.term_id, "asc")
        .select(({ info, terms }) => ({
          year: info.year,
          term_id: info.term_id,
          term_description: terms?.description,
          overall_gpa: info.overall_gpa,
          msu_gpa: info.msu_gpa,
          overall_earned_hours: info.overall_earned_hours,
        })),
  });

  const { data: courses, isLoading: coursesLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ studentCourses: studentCoursesCollection })
        .innerJoin({ courses: coursesCollection }, ({ studentCourses, courses }) =>
          eq(studentCourses.course_id, courses.id),
        )
        .leftJoin({ statuses: registrationStatusCollection }, ({ studentCourses, statuses }) =>
          eq(studentCourses.registration_status_id, statuses.id),
        )
        .where(({ studentCourses }) =>
          and(
            eq(studentCourses.mnumber, advisee.mnumber),
            eq(studentCourses.year, term.year),
            eq(studentCourses.term_id, term.term_id),
          ),
        )
        .orderBy(({ studentCourses }) => studentCourses.course_id, "asc")
        .select(({ studentCourses, courses, statuses }) => ({
          course_id: studentCourses.course_id,
          section: studentCourses.course_section,
          title: courses.title,
          hours: studentCourses.course_hours,
          status_id: studentCourses.registration_status_id,
          status: statuses?.description,
          midterm_grade: studentCourses.midterm_grade,
          final_grade: studentCourses.final_grade,
          grades_visible: studentCourses.grades_visible,
        })),
  });

  const latest = history.at(-1);

  // Enrolled courses first, then drops and withdrawals, which stay listed but faded
  const isEnrolled = (statusId: string | null) => ENROLLED_STATUSES.includes(statusId ?? "");
  const sortedCourses = [...courses].sort(
    (a, b) => Number(isEnrolled(b.status_id)) - Number(isEnrolled(a.status_id)),
  );
  const gpaTrend = history.map((info) => ({
    year_term: `${info.term_description ?? info.term_id} ${info.year}`,
    overall_gpa: info.overall_gpa,
    msu_gpa: info.msu_gpa,
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {advisee.email && (
          <a
            href={`mailto:${advisee.email}`}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
          >
            <MailIcon className="size-4" />
            {advisee.email}
          </a>
        )}
        <AttentionBadges advisee={advisee} />
      </div>

      <Section title="Overview">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <Fact label="Overall GPA" value={formatGpa(advisee.overall_gpa)} />
          <Fact label="MSU GPA" value={formatGpa(latest?.msu_gpa)} />
          <Fact label="Level" value={advisee.class_level ?? "—"} />
          <Fact label="Earned hours" value={latest?.overall_earned_hours ?? "—"} />
          <Fact label={`Hours in ${term.description}`} value={advisee.hours} />
          <Fact label="Standing" value={advisee.standing ?? "—"} />
        </dl>
        {advisee.programs.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {advisee.programs.map((program) => (
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
          <p className="text-muted-foreground text-sm">No declared programs.</p>
        )}
      </Section>

      <Separator />

      <Section title={`${term.description} ${term.year} courses`}>
        {coursesLoading ? (
          <Skeleton className="h-32" />
        ) : courses.length === 0 ? (
          <p className="text-muted-foreground text-sm">No courses this term.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Midterm</TableHead>
                  <TableHead>Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCourses.map((course) => {
                  const enrolled = isEnrolled(course.status_id);
                  return (
                    <TableRow
                      key={`${course.course_id}-${course.section}`}
                      className={cn(!enrolled && "text-muted-foreground")}
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
                      <TableCell className="text-right tabular-nums">{course.hours}</TableCell>
                      <TableCell>
                        {formatGrade(course.midterm_grade, course.grades_visible)}
                      </TableCell>
                      <TableCell>
                        {formatGrade(course.final_grade, course.grades_visible)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      <Separator />

      <Section title="GPA by term">
        {historyLoading ? (
          <Skeleton className="h-56" />
        ) : gpaTrend.length < 2 ? (
          <p className="text-muted-foreground text-sm">
            A trend shows up once there are at least two terms of GPA records.
          </p>
        ) : (
          <GPATrendChart gpaTrend={gpaTrend} />
        )}
      </Section>
    </div>
  );
}
