import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { courses } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type Course = typeof courses.$inferSelect;

export const coursesCollection = collectionOptions("courses", (client) =>
  queryCollectionOptions({
    queryKey: ["courses"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/courses`);
      return (await response.json()) as Array<Course>;
    },
    autoIndex: "eager",
    getKey: (course) => course.id,
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          fetch(`/api/data/courses`, {
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
