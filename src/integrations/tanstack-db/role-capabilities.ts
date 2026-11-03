import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { roleCapabilities } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, insertCollectionItem, deleteCollectionItem } from "./api";
import { RECORD_STALE_TIME } from "./stale-times";

type RoleCapability = typeof roleCapabilities.$inferSelect;

export const roleCapabilitiesCollection = collectionOptions("roleCapabilities", (client) =>
  queryCollectionOptions({
    queryKey: ["role-capabilities"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: RECORD_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: () => fetchCollection<RoleCapability>("role-capabilities"),
    getKey: (row) => `${row.role_id}-${row.capability}`,
    onInsert: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          insertCollectionItem<RoleCapability>("role-capabilities", mutation.modified),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
    onDelete: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          deleteCollectionItem<RoleCapability>("role-capabilities", mutation.original),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
  }),
);
