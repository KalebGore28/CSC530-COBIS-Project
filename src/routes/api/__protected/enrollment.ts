import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";
import { requireCapability } from "@/middleware/require-capability";
import {
  getCourseEnrollments,
  getEnrollmentSummary,
  getEnrollmentTerms,
  getInstructorEnrollments,
  getProgramEnrollments,
} from "@/utils/enrollment-counts";

// Both or neither, and the newest term is used when they're left out
const searchParamsSchema = z.union([
  z.object({ year: z.coerce.number().int(), term_id: z.string().min(1) }),
  z.object({ year: z.undefined(), term_id: z.undefined() }),
]);

export const Route = createFileRoute("/api/__protected/enrollment")({
  server: {
    middleware: [requireCapability("enrollment.view")],
    handlers: {
      GET: async ({ request, context }) => {
        const params = new URL(request.url).searchParams;
        const parsed = searchParamsSchema.safeParse({
          year: params.get("year") ?? undefined,
          term_id: params.get("term_id") ?? undefined,
        });

        if (!parsed.success) {
          return Response.json(
            { error: "Pass both year and term_id, or neither" },
            { status: 400 },
          );
        }

        // Enrollment is always for the viewer's own department
        const departmentId = context.faculty?.department_id;
        if (!departmentId) {
          return Response.json(
            { error: "Your account isn't linked to a department" },
            { status: 403 },
          );
        }

        const { db, access } = context;
        const terms = await getEnrollmentTerms(db, access, departmentId);
        const term =
          parsed.data.year !== undefined
            ? { year: parsed.data.year, term_id: parsed.data.term_id }
            : terms.at(0);

        // A department with no enrollments yet only gets the (empty) list of terms
        const body = term
          ? await Promise.all([
              getEnrollmentSummary(db, access, departmentId, term),
              getCourseEnrollments(db, access, departmentId, term),
              getInstructorEnrollments(db, access, departmentId, term),
              getProgramEnrollments(db, access, departmentId, term),
            ]).then(([summary, courses, instructors, programs]) => ({
              terms,
              term,
              summary,
              courses,
              instructors,
              programs,
            }))
          : { terms, term: null };

        const json = JSON.stringify(body);
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
