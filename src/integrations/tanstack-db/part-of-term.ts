import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { partOfTerm } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, updateCollectionItem } from "./api";
import { LOOKUP_STALE_TIME } from "./stale-times";

type PartOfTerm = typeof partOfTerm.$inferSelect;

export const partOfTermCollection = collectionOptions("partOfTerm", (client) =>
  queryCollectionOptions({
    queryKey: ["partOfTerm"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: LOOKUP_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: () => fetchCollection<PartOfTerm>("part-of-term"),
    getKey: (partOfTerm) => partOfTerm.id,
    onUpdate: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCollectionItem<PartOfTerm>("part-of-term", mutation.original, mutation.changes),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
  }),
);
