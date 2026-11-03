import { createFileRoute } from "@tanstack/react-router";
import { csvConfig } from "@/db/mapping-config";
import { findMissingColumns, findMySqlMatchingTables } from "@/utils/csv-importer";

export const Route = createFileRoute("/api/__protected/import/match")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const filename = url.searchParams.get("filename") || "";
        const tables = findMySqlMatchingTables(filename, csvConfig);
        const tableNames = Array.from(tables?.keys() || []);
        // The page sends the file's header row, so missing columns show up before uploading
        const headers = url.searchParams.getAll("header");
        const missingColumns = findMissingColumns(filename, headers, csvConfig);

        return new Response(JSON.stringify({ tableNames, missingColumns }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
