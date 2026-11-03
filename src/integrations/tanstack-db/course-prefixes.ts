import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { coursePrefixes } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, updateCollectionItem } from "./api";
import { LOOKUP_STALE_TIME } from "./stale-times";

type CoursePrefixes = typeof coursePrefixes.$inferSelect;

export const coursePrefixesCollection = collectionOptions("coursePrefixes", (client) =>
  queryCollectionOptions({
    queryKey: ["coursePrefixes"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: LOOKUP_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: () => fetchCollection<CoursePrefixes>("course-prefixes"),
    getKey: (prefix) => prefix.id,
    onUpdate: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCollectionItem<CoursePrefixes>(
            "course-prefixes",
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
