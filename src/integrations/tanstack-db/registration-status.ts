import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { registrationStatus } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, updateCollectionItem } from "./api";

type RegistrationStatus = typeof registrationStatus.$inferSelect;

export const registrationStatusCollection = collectionOptions("registrationStatus", (client) =>
  queryCollectionOptions({
    queryKey: ["registrationStatus"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: () => fetchCollection<RegistrationStatus>("registration-status"),
    autoIndex: "eager",
    getKey: (status) => status.id,
    onUpdate: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCollectionItem<RegistrationStatus>(
            "registration-status",
            mutation.original,
            mutation.changes,
          ),
        ),
      );
      await collection.utils.refetch();
    },
  }),
);
