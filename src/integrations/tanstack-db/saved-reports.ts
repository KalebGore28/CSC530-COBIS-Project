import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { QueryClient } from "@tanstack/react-query";
import type { ReportPage } from "@/lib/saved-reports";
import { RECORD_STALE_TIME } from "./stale-times";

export type SavedReport = {
  id: string;
  name: string;
  page: ReportPage;
  search: Record<string, unknown>;
  is_favorite: boolean;
  // An ISO date from the server, or the time it was saved while the save is on its way
  created_at: string;
};

// Throws the server's reason, like a duplicate name, so whoever made the change can show it
async function send(method: "POST" | "PUT" | "DELETE", body: Partial<SavedReport>) {
  const response = await fetch("/api/data/saved-reports", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (response.ok) return;

  const error = (await response.json().catch(() => null)) as { error?: string } | null;
  throw new Error(error?.error ?? "Couldn't save the report");
}

// The signed-in user's own saved reports
export const savedReportsCollection = collectionOptions("savedReport", (client) =>
  queryCollectionOptions({
    queryKey: ["saved-reports"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: RECORD_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: async () => {
      const response = await fetch("/api/data/saved-reports");
      if (!response.ok) throw new Error(`Failed to fetch saved reports: ${response.statusText}`);
      return (await response.json()) as Array<SavedReport>;
    },
    getKey: (report) => report.id,
    onInsert: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map(({ modified }) =>
          send("POST", {
            id: modified.id,
            name: modified.name,
            page: modified.page,
            search: modified.search,
            is_favorite: modified.is_favorite,
          }),
        ),
      );
    },
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map(({ original, changes }) =>
          send("PUT", { id: original.id, name: changes.name, is_favorite: changes.is_favorite }),
        ),
      );
    },
    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map(({ original }) => send("DELETE", { id: original.id })),
      );
    },
  }),
);
