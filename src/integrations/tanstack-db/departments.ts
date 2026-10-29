import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { departments } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type Department = typeof departments.$inferSelect;

export const departmentsCollection = collectionOptions(
  "departments",
  (client) =>
    queryCollectionOptions({
      queryKey: ["departments"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      queryFn: async () => {
        const response = await fetch(`/api/data/departments`);
        return (await response.json()) as Array<Department>;
      },
      autoIndex: "eager",
      getKey: (department) => department.id,
      onUpdate: async ({ transaction }) => {
        await Promise.all(
          transaction.mutations.map((mutation) =>
            fetch(`/api/data/departments`, {
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
