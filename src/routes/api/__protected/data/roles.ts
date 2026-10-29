import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { roles } from "@/db/schema";

export const Route = createFileRoute("/api/__protected/data/roles")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        // Only allow if user is cobis_administrator
        if (!context.roles.has("cobis_administrator")) {
          return new Response("Forbidden", { status: 403 });
        }

        const roleResults = await context.db.select().from(roles);

        const json = JSON.stringify(roleResults);
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
