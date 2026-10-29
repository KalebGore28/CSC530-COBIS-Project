import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { inArray } from "drizzle-orm";
import { students } from "@/db/schema";
import { getStudentAccessLevel } from "@/utils/get-student-access-level";

export const Route = createFileRoute("/api/__protected/data/students")({
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
          .from(students)
          // Immediately filter out students with no access
          .where(inArray(students.mnumber, Array.from(studentMnumbers.students)));

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
