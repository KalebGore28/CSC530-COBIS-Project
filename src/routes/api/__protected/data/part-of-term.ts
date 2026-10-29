import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { partOfTerm } from "@/db/schema";

type PartOfTerm = typeof partOfTerm.$inferSelect;

export const Route = createFileRoute("/api/__protected/data/part-of-term")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const partOfTermResults = await context.db.select().from(partOfTerm);

        const json = JSON.stringify(partOfTermResults);
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

        const updatedPartOfTerm: PartOfTerm = await request.json();

        const { id, ...updateData } = updatedPartOfTerm;

        await context.db.update(partOfTerm).set(updateData).where(eq(partOfTerm.id, id)).execute();

        return new Response(null, { status: 204 });
      },
    },
  },
});
