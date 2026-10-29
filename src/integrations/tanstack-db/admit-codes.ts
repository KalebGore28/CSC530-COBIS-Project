import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { admitCodes } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type AdmitCode = typeof admitCodes.$inferSelect;

export const admitCodesCollection = collectionOptions("admitCodes", (client) =>
  queryCollectionOptions({
    queryKey: ["admitCodes"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/admit-codes`);
      return (await response.json()) as Array<AdmitCode>;
    },
    autoIndex: "eager",
    getKey: (admitCode) => admitCode.id,
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          fetch(`/api/data/admit-codes`, {
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
