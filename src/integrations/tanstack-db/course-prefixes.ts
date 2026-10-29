import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { coursePrefixes } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type CoursePrefixes = typeof coursePrefixes.$inferSelect;

export const coursePrefixesCollection = collectionOptions(
  "coursePrefixes",
  (client) =>
    queryCollectionOptions({
      queryKey: ["coursePrefixes"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      queryFn: async () => {
        const response = await fetch(`/api/data/course-prefixes`);
        return (await response.json()) as Array<CoursePrefixes>;
      },
      autoIndex: "eager",
      getKey: (prefix) => prefix.id,
      onUpdate: async ({ transaction }) => {
        await Promise.all(
          transaction.mutations.map((mutation) =>
            fetch(`/api/data/course-prefixes`, {
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
