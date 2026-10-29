import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { terms } from "@/db/schema";

export const Route = createFileRoute("/api/__protected/data/terms")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const termResults = await context.db.select().from(terms);

        const json = JSON.stringify(termResults);
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
