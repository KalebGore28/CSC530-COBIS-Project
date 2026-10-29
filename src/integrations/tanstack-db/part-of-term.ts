import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { partOfTerm } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type PartOfTerm = typeof partOfTerm.$inferSelect;

export const partOfTermCollection = collectionOptions("partOfTerm", (client) =>
  queryCollectionOptions({
    queryKey: ["partOfTerm"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/part-of-term`);
      return (await response.json()) as Array<PartOfTerm>;
    },
    autoIndex: "eager",
    getKey: (partOfTerm) => partOfTerm.id,
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          fetch(`/api/data/part-of-term`, {
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
