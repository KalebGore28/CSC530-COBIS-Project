import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { courses } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, updateCollectionItem } from "./api";

type Course = typeof courses.$inferSelect;

export const coursesCollection = collectionOptions("courses", (client) =>
  queryCollectionOptions({
    queryKey: ["courses"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: () => fetchCollection<Course>("courses"),
    getKey: (course) => course.id,
    onUpdate: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCollectionItem<Course>("courses", mutation.original, mutation.changes),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
  }),
);
