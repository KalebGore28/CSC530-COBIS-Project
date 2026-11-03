import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { instructionalMethods } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, updateCollectionItem } from "./api";
import { LOOKUP_STALE_TIME } from "./stale-times";

type InstructionalMethod = typeof instructionalMethods.$inferSelect;

export const instructionalMethodsCollection = collectionOptions("instructionalMethods", (client) =>
  queryCollectionOptions({
    queryKey: ["instructionalMethods"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: LOOKUP_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: () => fetchCollection<InstructionalMethod>("instructional-methods"),
    getKey: (method) => method.id,
    onUpdate: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCollectionItem<InstructionalMethod>(
            "instructional-methods",
            mutation.original,
            mutation.changes,
          ),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
  }),
);
