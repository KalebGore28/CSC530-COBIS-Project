import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { registrationStatus } from "@/db/schema";

type RegistrationStatus = typeof registrationStatus.$inferSelect;

export const Route = createFileRoute("/api/__protected/data/registration-status")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const statusResults = await context.db.select().from(registrationStatus);

        const json = JSON.stringify(statusResults);
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

        const updatedStatus: RegistrationStatus = await request.json();

        const { id, ...updateData } = updatedStatus;

        await context.db
          .update(registrationStatus)
          .set(updateData)
          .where(eq(registrationStatus.id, id))
          .execute();

        return new Response(null, { status: 204 });
      },
    },
  },
});
