import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { importJobs } from "@/db/schema";
import {
  attachStreamController,
  detachStreamController,
  getImportState,
  toProgressChunk,
} from "@/utils/import-state";
import type { ProgressChunk } from "@/utils/import-state";

// A stream with a single chunk, for imports that have already finished
function singleChunkResponse(chunk: ProgressChunk) {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(JSON.stringify(chunk) + "\n");
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
    },
  });
}

export const Route = createFileRoute("/api/__protected/import/$importId/progress")({
  server: {
    handlers: {
      GET: async ({ params, context }) => {
        const { importId } = params;

        // Check if import is active in memory
        const state = getImportState(importId);

        if (state) {
          // Already finished, so send the final status and close
          if (state.status === "done" || state.status === "failed") {
            return singleChunkResponse(toProgressChunk(state));
          }

          // Import is actively processing - stream live updates
          let streamController: ReadableStreamDefaultController | null = null;
          const stream = new ReadableStream({
            start(controller) {
              streamController = controller;
              // Attach controller to state so updates can be sent
              attachStreamController(importId, controller);
              // Send current state immediately
              controller.enqueue(JSON.stringify(toProgressChunk(state)) + "\n");
            },
            cancel() {
              // Client disconnected, so stop sending it updates
              if (streamController) detachStreamController(importId, streamController);
            },
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/plain",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        }

        // Not in memory - check database for final status
        const [job] = await context.db
          .select()
          .from(importJobs)
          .where(eq(importJobs.id, importId))
          .limit(1);

        if (!job) {
          return new Response(JSON.stringify({ error: "Import not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Imports only run in memory, so one still marked pending or processing here was cut off by a server restart
        const error =
          job.status === "done"
            ? undefined
            : job.status === "failed"
              ? (job.error ?? "Import failed")
              : "The server restarted before this import finished. Import the file again.";

        return singleChunkResponse({
          processed: job.totalRows || 0,
          total: job.totalRows || 0,
          totalRows: job.totalRows || 0,
          percent: job.status === "done" ? 100 : 0,
          errorCount: job.errorCount || 0,
          warningCount: job.warningCount || 0,
          currentStep: job.status === "done" ? "Import complete" : "Import failed",
          done: true,
          error,
        });
      },
    },
  },
});
