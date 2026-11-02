import { gzipSync } from "node:zlib";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { admitCodes } from "@/db/schema";

type AdmitCode = typeof admitCodes.$inferSelect;

export const Route = createFileRoute("/api/__protected/data/admit-codes")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const admitCodeResults = await context.db.select().from(admitCodes);

        const json = JSON.stringify(admitCodeResults);
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
        // Only allow users who can manage COBIS data
        if (!context.capabilities.has("tools.manage")) {
          return new Response("Forbidden", { status: 403 });
        }

        const updatedAdmitCode: AdmitCode = await request.json();

        const { id, ...updateData } = updatedAdmitCode;

        await context.db.update(admitCodes).set(updateData).where(eq(admitCodes.id, id)).execute();

        return new Response(null, { status: 204 });
      },
    },
  },
});
