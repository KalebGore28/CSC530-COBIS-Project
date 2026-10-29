import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { instructionalMethods } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type InstructionalMethod = typeof instructionalMethods.$inferSelect;

export const instructionalMethodsCollection = collectionOptions(
  "instructionalMethods",
  (client) =>
    queryCollectionOptions({
      queryKey: ["instructionalMethods"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      queryFn: async () => {
        const response = await fetch(`/api/data/instructional-methods`);
        return (await response.json()) as Array<InstructionalMethod>;
      },
      autoIndex: "eager",
      getKey: (method) => method.id,
      onUpdate: async ({ transaction }) => {
        await Promise.all(
          transaction.mutations.map((mutation) =>
            fetch(`/api/data/instructional-methods`, {
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
