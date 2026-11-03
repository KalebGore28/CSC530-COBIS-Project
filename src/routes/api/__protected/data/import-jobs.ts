import { createFileRoute } from "@tanstack/react-router";
import { desc } from "drizzle-orm";
import { gzipSync } from "zlib";
import { importJobs } from "@/db/schema";
import { getImportState } from "@/utils/import-state";

export const Route = createFileRoute("/api/__protected/data/import-jobs")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        // Only allow users who can manage COBIS data
        if (!context.capabilities.has("tools.manage")) {
          return new Response("Forbidden", { status: 403 });
        }

        // Get all import jobs ordered by most recent first
        const jobs = await context.db.select().from(importJobs).orderBy(desc(importJobs.createdAt));

        // Imports only run in memory, so one still marked pending or processing without a running state was cut off by a server restart
        const jobsWithInterrupted = jobs.map((job) =>
          (job.status === "pending" || job.status === "processing") && !getImportState(job.id)
            ? {
                ...job,
                status: "failed" as const,
                error: "The server restarted before this import finished. Import the file again.",
              }
            : job,
        );

        // Compress response
        const compressed = gzipSync(Buffer.from(JSON.stringify(jobsWithInterrupted)));

        return new Response(compressed, {
          headers: {
            "Content-Type": "application/json",
            "Content-Encoding": "gzip",
          },
        });
      },
    },
  },
});
