import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { and, getColumns } from "drizzle-orm";
import { students } from "@/db/schema";
import { STUDENT_ROW } from "@/utils/data-access";
import { buildSubsetWhere, readSubsetFilters } from "@/utils/subset-filters";

// Gender is left out because it's masked
const FILTERABLE_COLUMNS = {
  mnumber: students.mnumber,
  first_name: students.first_name,
  last_name: students.last_name,
  email: students.email,
};

export const Route = createFileRoute("/api/__protected/data/students")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const filters = await readSubsetFilters(request);
        if (!filters) return new Response("Invalid filters", { status: 400 });

        const results = await context.db
          .select({
            ...getColumns(students),
            gender: context.access.masked("demographics", STUDENT_ROW, students.gender),
          })
          .from(students)
          .where(
            and(
              context.access.canSee("identity", STUDENT_ROW),
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
