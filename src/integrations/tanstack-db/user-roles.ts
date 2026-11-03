import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { userRoles } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { insertCollectionItem, deleteCollectionItem } from "./api";
import { RECORD_STALE_TIME } from "./stale-times";

type UserRole = typeof userRoles.$inferSelect;

export const userRolesCollection = collectionOptions("userRole", (client) =>
  queryCollectionOptions({
    queryKey: ["user-roles"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: RECORD_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: async () => {
      const response = await fetch(`/api/data/user-roles`);
      return (await response.json()) as Array<UserRole>;
    },
    getKey: (userRole) => `${userRole.user_id}-${userRole.role_id}`,
    onInsert: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          insertCollectionItem<UserRole>("user-roles", mutation.modified),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
    onDelete: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          deleteCollectionItem<UserRole>("user-roles", mutation.original),
        ),
      );
      await collection.utils.refetch();
      return { refetch: false };
    },
  }),
);
