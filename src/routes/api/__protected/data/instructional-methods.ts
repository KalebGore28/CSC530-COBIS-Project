import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { instructionalMethods } from "@/db/schema";

type InstructionalMethod = typeof instructionalMethods.$inferSelect;

export const Route = createFileRoute("/api/__protected/data/instructional-methods")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const instructionalMethodResults = await context.db.select().from(instructionalMethods);

        const json = JSON.stringify(instructionalMethodResults);
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

        const updatedInstructionalMethod: InstructionalMethod = await request.json();

        const { id, ...updateData } = updatedInstructionalMethod;

        await context.db
          .update(instructionalMethods)
          .set(updateData)
          .where(eq(instructionalMethods.id, id))
          .execute();

        return new Response(null, { status: 204 });
      },
    },
  },
});
