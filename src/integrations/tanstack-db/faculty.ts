import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { faculty } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { updateCollectionItem } from "./api";
import { LOOKUP_STALE_TIME } from "./stale-times";

type Faculty = typeof faculty.$inferSelect;

export const facultyCollection = collectionOptions("faculty", (client) =>
  queryCollectionOptions({
    queryKey: ["faculty"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: LOOKUP_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: async () => {
      const response = await fetch(`/api/data/faculty`);
      return (await response.json()) as Array<Faculty>;
    },
    getKey: (faculty) => faculty.mnumber,
    onUpdate: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCollectionItem<Faculty>(
            "faculty",
            mutation.original,
            {
              first_name: mutation.original.first_name,
              last_name: mutation.original.last_name,
              ...mutation.changes,
            },
            "mnumber",
          ),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
  }),
);
