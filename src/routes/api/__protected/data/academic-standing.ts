import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { academicStanding } from "@/db/schema";

type AcademicStanding = typeof academicStanding.$inferSelect;

export const Route = createFileRoute("/api/__protected/data/academic-standing")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const standingResults = await context.db.select().from(academicStanding);

        const json = JSON.stringify(standingResults);
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

        const updatedStanding: AcademicStanding = await request.json();

        const { id, ...updateData } = updatedStanding;

        await context.db
          .update(academicStanding)
          .set(updateData)
          .where(eq(academicStanding.id, id))
          .execute();

        return new Response(null, { status: 204 });
      },
    },
  },
});
