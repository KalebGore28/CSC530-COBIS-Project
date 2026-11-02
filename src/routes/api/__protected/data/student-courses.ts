import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { and, getColumns } from "drizzle-orm";
import { studentCourses } from "@/db/schema";
import { STUDENT_COURSE_ROW } from "@/utils/data-access";
import { buildSubsetWhere, readSubsetFilters } from "@/utils/subset-filters";

// Grades and attendance are left out because they're masked
const FILTERABLE_COLUMNS = {
  mnumber: studentCourses.mnumber,
  term_id: studentCourses.term_id,
  year: studentCourses.year,
  course_id: studentCourses.course_id,
  course_section: studentCourses.course_section,
  instructor_mnumber: studentCourses.instructor_mnumber,
};

export const Route = createFileRoute("/api/__protected/data/student-courses")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const filters = await readSubsetFilters(request);
        if (!filters) return new Response("Invalid filters", { status: 400 });

        const { access } = context;
        const results = await context.db
          .select({
            ...getColumns(studentCourses),
            midterm_grade: access.masked(
              "grades",
              STUDENT_COURSE_ROW,
              studentCourses.midterm_grade,
            ),
            final_grade: access.masked("grades", STUDENT_COURSE_ROW, studentCourses.final_grade),
            last_attendance: access.masked(
              "attendance",
              STUDENT_COURSE_ROW,
              studentCourses.last_attendance,
            ),
            grades_visible: access.isVisible("grades", STUDENT_COURSE_ROW),
          })
          .from(studentCourses)
          .where(
            and(
              access.canSee("courses", STUDENT_COURSE_ROW),
              ...buildSubsetWhere(filters, FILTERABLE_COLUMNS),
            ),
          );

        const json = JSON.stringify(results);
        const compressed = gzipSync(Buffer.from(json));

        return new Response(compressed, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Content-Encoding": "gzip",
          },
        });
      },
    },
  },
});
