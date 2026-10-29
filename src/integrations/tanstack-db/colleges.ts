import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { colleges } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type College = typeof colleges.$inferSelect;

export const collegesCollection = collectionOptions("colleges", (client) =>
  queryCollectionOptions({
    queryKey: ["colleges"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/colleges`);
      return (await response.json()) as Array<College>;
    },
    autoIndex: "eager",
    getKey: (college) => college.id,
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          fetch(`/api/data/colleges`, {
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
