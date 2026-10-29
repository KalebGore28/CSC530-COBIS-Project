import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { eq, inArray } from "drizzle-orm";
import { courses, studentCourses } from "@/db/schema";
import { createAccessKey, getStudentAccessLevel } from "@/utils/get-student-access-level";

export const Route = createFileRoute("/api/__protected/data/student-courses")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        // Get student access restrictions based on roles
        const studentMnumbers = await getStudentAccessLevel(
          context.user.mnumber,
          context.roles,
          context.faculty.department_id || "",
        );

        const results = await context.db
          .select()
          .from(studentCourses)
          // Immediately filter out students with no access
          .innerJoin(courses, eq(studentCourses.course_id, courses.id))
          .where(inArray(studentCourses.mnumber, Array.from(studentMnumbers.students)));

        const finalResults: Array<(typeof results)[number]["student_courses"]> = [];
        for (const student of results) {
          const studentCacheKey = createAccessKey(
            student.student_courses.mnumber,
            student.student_courses.year,
            student.student_courses.term_id,
          );

          const accessData = studentMnumbers.terms.get(studentCacheKey);

          if (!accessData) continue;

          // --- Permission Check Area 1 Order: TOP -> DOWN ---
          // We check the most permissive roles first, so that we can skip unnecessary checks for users with high-level access

          // Advisors have full access to all the student's courses for that term/year
          if (accessData.role === "advisor") {
            finalResults.push({
              ...student.student_courses,
              // Diagnostic Info:
              accessLevel: accessData.accessLevel,
              role: accessData.role,
              reason: accessData.reason,
            });
            continue; // No need to go further, since advisors have access to all their advisees' courses
          }

          // Program coordinators have full access to all students in their program for that term/year
          if (accessData.role === "program_coordinator") {
            finalResults.push({
              ...student.student_courses,
              // Diagnostic Info:
              accessLevel: accessData.accessLevel,
              role: accessData.role,
              reason: accessData.reason,
            });
            continue; // No need to go further, since program coordinators have full access to students' who are in their program
          }

          // --- Permission Check Area 1 End ---

          // --- Permission Check Area 2 Start ---
          // Instructors have full access to their own courses
          if (student.student_courses.instructor_mnumber === context.user.mnumber) {
            finalResults.push({
              ...student.student_courses,
              // Diagnostic Info:
              accessLevel: accessData.accessLevel,
              role: accessData.role,
              reason: accessData.reason,
            });
            continue; // No need to go further, since instructor has access to all their own courses
          }
          // --- Permission Check Area 2 End ---

          /**
           * If we've reached this point, the user is not an advisor or program coordinator to the student for this term/year,
           * and is not an instructor for this course, but they may still have access based on more specific rules.
           */

          // --- Permission Check Area 3 Order: BOTTOM -> UP ---
          if (accessData.role === "admin_assistant") {
            // Check if student course is in the same department as the admin assistant
            if (student.courses.department_id !== context.faculty.department_id) continue;

            // Strip out grades for admin assistants
            finalResults.push({
              ...student.student_courses,
              midterm_grade: null,
              final_grade: null,
              // Diagnostic Info:
              accesslevel: accessData.accessLevel,
              role: accessData.role,
              reason: accessData.reason,
            });
            continue;
          }

          if (accessData.role === "department_chair") {
            // Check if student course is in the same department as the department head
            if (student.courses.department_id !== context.faculty.department_id) continue;

            finalResults.push({
              ...student.student_courses,
              // Diagnostic Info:
              accesslevel: accessData.accessLevel,
              role: accessData.role,
              reason: accessData.reason,
            });
          }

          // If the user doesn't match any of the above roles, they don't get access to the course
        }

        const json = JSON.stringify(finalResults);
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
