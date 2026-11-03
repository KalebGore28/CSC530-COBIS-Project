import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { user } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, updateCollectionItem } from "./api";
import { RECORD_STALE_TIME } from "./stale-times";

type User = typeof user.$inferSelect;

export const usersCollection = collectionOptions("user", (client) =>
  queryCollectionOptions({
    queryKey: ["users"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: RECORD_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: () => fetchCollection<User>("users"),
    getKey: (user) => user.id,
    onUpdate: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCollectionItem<User>("users", mutation.original, mutation.changes),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
  }),
);
