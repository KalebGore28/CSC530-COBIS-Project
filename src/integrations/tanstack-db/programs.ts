import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { programs } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type Program = typeof programs.$inferSelect;

export const programsCollection = collectionOptions("program", (client) =>
  queryCollectionOptions({
    queryKey: ["program"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/programs`);
      return (await response.json()) as Array<Program>;
    },
    getKey: (program) => program.id,
    autoIndex: "eager",
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          fetch(`/api/data/programs`, {
            method: "PUT",
            body: JSON.stringify({
              id: mutation.original.id,
              ...mutation.changes,
            }),
          }),
        ),
      );
    },
  }),
);
