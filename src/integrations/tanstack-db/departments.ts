import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { departments } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, updateCollectionItem } from "./api";

type Department = typeof departments.$inferSelect;

export const departmentsCollection = collectionOptions("departments", (client) =>
  queryCollectionOptions({
    queryKey: ["departments"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: () => fetchCollection<Department>("departments"),
    getKey: (department) => department.id,
    onUpdate: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCollectionItem<Department>("departments", mutation.original, mutation.changes),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
  }),
);
