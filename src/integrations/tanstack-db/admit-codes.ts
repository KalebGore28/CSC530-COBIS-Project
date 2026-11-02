import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { admitCodes } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, updateCollectionItem } from "./api";

type AdmitCode = typeof admitCodes.$inferSelect;

export const admitCodesCollection = collectionOptions("admitCodes", (client) =>
  queryCollectionOptions({
    queryKey: ["admitCodes"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: () => fetchCollection<AdmitCode>("admit-codes"),
    getKey: (admitCode) => admitCode.id,
    onUpdate: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCollectionItem<AdmitCode>("admit-codes", mutation.original, mutation.changes),
        ),
      );
      await collection.utils.refetch();
    },
  }),
);
