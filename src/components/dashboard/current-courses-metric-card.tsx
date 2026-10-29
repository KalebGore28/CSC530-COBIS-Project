import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { useNavigate } from "@tanstack/react-router";
import { ChartBar } from "lucide-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useCurrentTerm } from "@/providers/current-term-provider";
import { studentCoursesCollection } from "@/integrations/tanstack-db/student-courses";

export function CurrentTermMetricCard({ mnumber }: { mnumber: string }) {
  const navigate = useNavigate();

  const { currentTerm, isLoading: isCurrentTermLoading } = useCurrentTerm();

  const { data: uniqueStudents, isLoading: isUniqueStudentsLoading } = useLiveQuery((q) =>
    q
      .from({ studentCourses: studentCoursesCollection })
      .where(({ studentCourses }) =>
        and(
          eq(studentCourses.instructor_mnumber, mnumber),
          eq(studentCourses.year, currentTerm.year),
          eq(studentCourses.term_id, currentTerm.term_id),
        ),
      )
      .select(({ studentCourses }) => ({
        mnumber: studentCourses.mnumber,
        year: studentCourses.year,
        term_id: studentCourses.term_id,
      }))
      .distinct(),
  );

  const { data: uniqueCourses, isLoading: isUniqueCoursesLoading } = useLiveQuery((q) =>
    q
      .from({ studentCourses: studentCoursesCollection })
      .where(({ studentCourses }) =>
        and(
          eq(studentCourses.instructor_mnumber, mnumber),
          eq(studentCourses.year, currentTerm.year),
          eq(studentCourses.term_id, currentTerm.term_id),
        ),
      )
      .select(({ studentCourses }) => ({
        course_id: studentCourses.course_id,
        course_section: studentCourses.course_section,
        year: studentCourses.year,
        term_id: studentCourses.term_id,
      }))
      .distinct(),
  );

  const { data: termStudents, isLoading: isTermStudentsLoading } = useLiveQuery((q) =>
    q
      .from({ studentCourses: studentCoursesCollection })
      .where(({ studentCourses }) =>
        and(
          eq(studentCourses.instructor_mnumber, mnumber),
          eq(studentCourses.year, currentTerm.year),
          eq(studentCourses.term_id, currentTerm.term_id),
        ),
      ),
  );

  if (
    isCurrentTermLoading ||
    isUniqueStudentsLoading ||
    isUniqueCoursesLoading ||
    isTermStudentsLoading
  )
    return null;

  const totalCreditHours = termStudents.reduce((sum, sc) => sum + sc.course_hours, 0);

  return (
    <Card
      className="h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
      onClick={() => navigate({ to: "/class-roster" })}
    >
      <CardHeader className="h-full">
        <div className="mb-2 flex items-center gap-2">
          <ChartBar className="h-6 w-6" />

          <CardTitle>Current Term Metrics</CardTitle>
        </div>
        <CardDescription className="flex flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{uniqueStudents.length}</span>
            <span>{uniqueStudents.length === 1 ? "unique student" : "unique students"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{uniqueCourses.length}</span>
            <span>{uniqueCourses.length === 1 ? "course" : "courses"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{totalCreditHours}</span>

            <span>Total Credit Hours</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="flex flex-wrap items-center gap-1">
          <span>See more details about your courses at</span>
          <span className="font-semibold">Class Roster</span>
        </div>
      </CardFooter>
    </Card>
  );
}
