import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { and } from "drizzle-orm";
import { studentAdvisors } from "@/db/schema";
import { STUDENT_ADVISOR_ROW } from "@/utils/data-access";
import { buildSubsetWhere, readSubsetFilters } from "@/utils/subset-filters";

const FILTERABLE_COLUMNS = {
  mnumber: studentAdvisors.mnumber,
  term_id: studentAdvisors.term_id,
  year: studentAdvisors.year,
  advisor_mnumber: studentAdvisors.advisor_mnumber,
};

export const Route = createFileRoute("/api/__protected/data/student-advisors")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const filters = await readSubsetFilters(request);
        if (!filters) return new Response("Invalid filters", { status: 400 });

        const results = await context.db
          .select()
          .from(studentAdvisors)
          .where(
            and(
              context.access.canSee("advisors", STUDENT_ADVISOR_ROW),
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
