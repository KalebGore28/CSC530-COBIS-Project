import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { inArray } from "drizzle-orm";
import { studentAdvisors } from "@/db/schema";
import { createAccessKey, getStudentAccessLevel } from "@/utils/get-student-access-level";

export const Route = createFileRoute("/api/__protected/data/student-advisors")({
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
          .from(studentAdvisors)
          // Immediately filter out students with no access
          .where(inArray(studentAdvisors.mnumber, Array.from(studentMnumbers.students)));

        const finalResults: typeof results = [];
        for (const student of results) {
          const studentCacheKey = createAccessKey(student.mnumber, student.year, student.term_id);

          const accessData = studentMnumbers.terms.get(studentCacheKey);
          if (!accessData) continue;

          // Only users with full access can see student advisors
          if (accessData.accessLevel === "limited" || accessData.accessLevel === "course_scoped")
            continue;

          finalResults.push(student);
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
