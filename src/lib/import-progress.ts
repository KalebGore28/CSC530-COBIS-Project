import { experimental_streamedQuery as streamedQuery, queryOptions } from "@tanstack/react-query";
import type { ProgressChunk } from "@/utils/import-state";

export type { ProgressChunk };

async function* fetchImportProgress(importId: string): AsyncIterable<ProgressChunk> {
  const response = await fetch(`/api/import/${importId}/progress`);
  if (!response.ok || !response.body) {
    throw new Error(`Could not load import progress (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  // A network chunk can end partway through a line, so the unfinished part waits for the next chunk
  let buffered = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Server sends newline-delimited JSON chunks
    buffered += decoder.decode(value, { stream: true });
    const lines = buffered.split("\n");
    buffered = lines.pop() ?? "";
    for (const line of lines.filter(Boolean)) {
      yield JSON.parse(line) as ProgressChunk;
    }
  }
}

export const importProgressQuery = (importId: string) =>
  queryOptions({
    queryKey: ["import-progress", importId],
    queryFn: streamedQuery({
      streamFn: () => fetchImportProgress(importId),
      // Keep a single "latest" chunk instead of accumulating all of them
      reducer: (_, chunk) => chunk,
      initialValue: {
        processed: 0,
        total: 0,
        totalRows: 0,
        percent: 0,
        errorCount: 0,
        warningCount: 0,
        currentStep: "Starting...",
      } as ProgressChunk,
    }),
    enabled: !!importId,
  });
