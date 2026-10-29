import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { faculty } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type Faculty = typeof faculty.$inferSelect;

export const facultyCollection = collectionOptions("faculty", (client) =>
  queryCollectionOptions({
    queryKey: ["faculty"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/faculty`);
      return (await response.json()) as Array<Faculty>;
    },
    autoIndex: "eager",
    getKey: (faculty) => faculty.mnumber,
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          fetch(`/api/data/faculty`, {
            method: "PUT",
            body: JSON.stringify({
              mnumber: mutation.original.mnumber,
              first_name: mutation.original.first_name,
              last_name: mutation.original.last_name,
              ...mutation.changes,
            }),
          }),
        ),
      );
    },
  }),
);
