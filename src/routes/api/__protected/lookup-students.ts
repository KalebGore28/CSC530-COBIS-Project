import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import Papa from "papaparse";
import * as z from "zod";
import { requireCapability } from "@/middleware/require-capability";
import { hidesAcademicInfoOnLookup } from "@/types/access-checks";
import {
  CLASS_LEVELS,
  LETTER_GRADES,
  countStudents,
  findStudents,
  getCurrentPrograms,
} from "@/utils/student-lookup";
import type { StudentLookupFilters } from "@/utils/student-lookup";

const PAGE_SIZE = 25;

const searchParamsSchema = z.object({
  program: z.array(z.string().min(1)),
  programType: z.enum(["major", "minor", "any"]).default("any"),
  course: z.array(z.string().min(1)),
  // Defaults to students who have taken the course
  courseTaken: z.enum(["true", "false"]).default("true"),
  minGrade: z.enum(LETTER_GRADES).optional(),
  level: z.array(z.enum(CLASS_LEVELS)),
  gpaMin: z.coerce.number().min(0).max(4).optional(),
  sort: z.enum(["name", "gpa"]).default("name"),
  page: z.coerce.number().int().min(1).default(1),
  format: z.enum(["json", "csv"]).default("json"),
});

export const Route = createFileRoute("/api/__protected/lookup-students")({
  server: {
    middleware: [requireCapability("student.lookup")],
    handlers: {
      GET: async ({ request, context }) => {
        const params = new URL(request.url).searchParams;
        const parsed = searchParamsSchema.safeParse({
          program: params.getAll("program"),
          programType: params.get("programType") ?? undefined,
          course: params.getAll("course"),
          courseTaken: params.get("courseTaken") ?? undefined,
          minGrade: params.get("minGrade") ?? undefined,
          level: params.getAll("level"),
          gpaMin: params.get("gpaMin") ?? undefined,
          sort: params.get("sort") ?? undefined,
          page: params.get("page") ?? undefined,
          format: params.get("format") ?? undefined,
        });

        if (!parsed.success) {
          return Response.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
        }

        const { db } = context;
        const access = hidesAcademicInfoOnLookup(context.roles)
          ? context.access.withoutCategory("academic_info")
          : context.access;
        const search = parsed.data;
        const canSeeAcademicInfo = access.hasCategory("academic_info");

        // These would only ever match nothing for someone who can't see them, like an admin assistant
        if (!canSeeAcademicInfo && (search.gpaMin !== undefined || search.level.length > 0)) {
          return Response.json(
            { error: "You can't search by GPA or class level" },
            { status: 403 },
          );
        }
        if (!access.hasCategory("grades") && search.minGrade) {
          return Response.json({ error: "You can't search by grade" }, { status: 403 });
        }

        const filters: StudentLookupFilters = {
          programIds: search.program,
          programType:
            search.programType === "major"
              ? "MAJOR"
              : search.programType === "minor"
                ? "MINOR"
                : "ANY",
          courseIds: search.course,
          courseTaken: search.courseTaken === "true",
          // A minimum grade only applies to students who took the course
          minGrade: search.courseTaken === "true" ? search.minGrade : undefined,
          levels: search.level,
          gpaMin: search.gpaMin,
        };

        if (search.format === "csv") {
          // Every match, not just the page on screen
          const matches = await findStudents(db, access, filters, search.sort);
          const programRows = await getCurrentPrograms(
            db,
            access,
            matches.map((student) => student.mnumber),
          );

          const csv = Papa.unparse(
            matches.map((student) => ({
              "M-Number": student.mnumber,
              "Last name": student.last_name,
              "First name": student.first_name,
              Email: student.email ?? "",
              Programs: programRows
                .filter((program) => program.mnumber === student.mnumber)
                .map(
                  (program) =>
                    `${program.description} (${program.type === "MAJOR" ? "Major" : "Minor"})`,
                )
                .join("; "),
              ...(canSeeAcademicInfo && {
                Level: student.class_level ?? "",
                GPA: student.overall_gpa ?? "",
              }),
            })),
          );

          return new Response(gzipSync(Buffer.from(csv)), {
            status: 200,
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="student-lookup-${new Date().toISOString().slice(0, 10)}.csv"`,
              "Content-Encoding": "gzip",
            },
          });
        }

        const [total, matches] = await Promise.all([
          countStudents(db, access, filters),
          findStudents(db, access, filters, search.sort, {
            offset: (search.page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
          }),
        ]);
        const programRows = await getCurrentPrograms(
          db,
          access,
          matches.map((student) => student.mnumber),
        );

        const studentsWithPrograms = matches.map((student) => ({
          ...student,
          programs: programRows
            .filter((program) => program.mnumber === student.mnumber)
            .map(({ program_id, description, type }) => ({ program_id, description, type })),
        }));

        const json = JSON.stringify({
          students: studentsWithPrograms,
          total,
          page: search.page,
          pageSize: PAGE_SIZE,
        });

        return new Response(gzipSync(Buffer.from(json)), {
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
