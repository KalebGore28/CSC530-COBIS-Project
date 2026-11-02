import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { userRoles } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type UserRole = typeof userRoles.$inferSelect;

export const userRolesCollection = collectionOptions("userRole", (client) =>
  queryCollectionOptions({
    queryKey: ["user-roles"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/user-roles`);
      return (await response.json()) as Array<UserRole>;
    },
    getKey: (userRole) => `${userRole.user_id}-${userRole.role_id}`,
    onInsert: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          fetch(`/api/data/user-roles`, {
            method: "POST",
            body: JSON.stringify(mutation.modified),
          }),
        ),
      );
    },
    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          fetch(`/api/data/user-roles`, {
            method: "DELETE",
            body: JSON.stringify(mutation.original),
          }),
        ),
      );
    },
  }),
);
