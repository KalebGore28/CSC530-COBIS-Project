import { createFileRoute } from "@tanstack/react-router";
import type { ImportStreamMessage } from "@/utils/csv-importer";
import { csvConfig } from "@/db/mapping-config";
import { importMySqlData } from "@/utils/csv-importer";

export const Route = createFileRoute("/api/__protected/import/process")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const { filename, csvData } = await request.json();

        // Create a readable stream that will send progress events
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const send = (obj: ImportStreamMessage) => {
              controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
            };

            try {
              await importMySqlData(context.db, csvData, filename, csvConfig, 100, {
                send,
                end: () => controller.close(),
              });
            } catch (err) {
              send({
                type: "error",
                error: String(err),
                // @ts-ignore: Temporal workaround for strict null checks
                data: undefined,
              });
            }
            controller.close();
          },
        });

        return new Response(stream, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
