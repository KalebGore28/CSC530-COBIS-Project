import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { roleDataAccess } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, insertCollectionItem, deleteCollectionItem } from "./api";
import { RECORD_STALE_TIME } from "./stale-times";

type RoleDataAccess = typeof roleDataAccess.$inferSelect;

export const roleDataAccessCollection = collectionOptions("roleDataAccess", (client) =>
  queryCollectionOptions({
    queryKey: ["role-data-access"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: RECORD_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: () => fetchCollection<RoleDataAccess>("role-data-access"),
    getKey: (row) => `${row.role_id}-${row.relationship}-${row.category}`,
    onInsert: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          insertCollectionItem<RoleDataAccess>("role-data-access", mutation.modified),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
    onDelete: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          deleteCollectionItem<RoleDataAccess>("role-data-access", mutation.original),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
  }),
);
