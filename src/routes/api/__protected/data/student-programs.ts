import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { and } from "drizzle-orm";
import { studentPrograms } from "@/db/schema";
import { STUDENT_PROGRAM_ROW } from "@/utils/data-access";
import { buildSubsetWhere, readSubsetFilters } from "@/utils/subset-filters";

const FILTERABLE_COLUMNS = {
  mnumber: studentPrograms.mnumber,
  term_id: studentPrograms.term_id,
  year: studentPrograms.year,
  program_id: studentPrograms.program_id,
  type: studentPrograms.type,
  level: studentPrograms.level,
};

export const Route = createFileRoute("/api/__protected/data/student-programs")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const filters = await readSubsetFilters(request);
        if (!filters) return new Response("Invalid filters", { status: 400 });

        const results = await context.db
          .select()
          .from(studentPrograms)
          .where(
            and(
              context.access.canSee("programs", STUDENT_PROGRAM_ROW),
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
