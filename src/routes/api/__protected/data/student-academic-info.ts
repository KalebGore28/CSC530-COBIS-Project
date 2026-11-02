import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { and } from "drizzle-orm";
import { studentAcademicInfo } from "@/db/schema";
import { STUDENT_ACADEMIC_INFO_ROW } from "@/utils/data-access";
import { buildSubsetWhere, readSubsetFilters } from "@/utils/subset-filters";

const FILTERABLE_COLUMNS = {
  mnumber: studentAcademicInfo.mnumber,
  term_id: studentAcademicInfo.term_id,
  year: studentAcademicInfo.year,
};

export const Route = createFileRoute("/api/__protected/data/student-academic-info")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const filters = await readSubsetFilters(request);
        if (!filters) return new Response("Invalid filters", { status: 400 });

        const results = await context.db
          .select()
          .from(studentAcademicInfo)
          .where(
            and(
              context.access.canSee("academic_info", STUDENT_ACADEMIC_INFO_ROW),
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
