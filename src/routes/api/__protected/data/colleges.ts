import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { colleges } from "@/db/schema";

type College = typeof colleges.$inferSelect;

export const Route = createFileRoute("/api/__protected/data/colleges")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const collegeResults = await context.db.select().from(colleges);

        const json = JSON.stringify(collegeResults);
        const compressed = gzipSync(Buffer.from(json));

        return new Response(compressed, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Content-Encoding": "gzip",
          },
        });
      },
      PUT: async ({ request, context }) => {
        // Only allow if user is cobis_administrator
        if (!context.roles.has("cobis_administrator")) {
          return new Response("Forbidden", { status: 403 });
        }

        const updatedCollege: College = await request.json();

        const { id, ...updateData } = updatedCollege;

        await context.db.update(colleges).set(updateData).where(eq(colleges.id, id)).execute();

        return new Response(null, { status: 204 });
      },
    },
  },
});
