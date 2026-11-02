import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { colleges } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, updateCollectionItem } from "./api";

type College = typeof colleges.$inferSelect;

export const collegesCollection = collectionOptions("colleges", (client) =>
  queryCollectionOptions({
    queryKey: ["colleges"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: () => fetchCollection<College>("colleges"),
    getKey: (college) => college.id,
    onUpdate: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCollectionItem<College>("colleges", mutation.original, mutation.changes),
        ),
      );
      await collection.utils.refetch();
    },
  }),
);
