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
    autoIndex: "eager",
    getKey: (userRole) => `${userRole.user_id}-${userRole.role_id}`,
    onInsert: async ({ transaction }) => {
      const newUserRole: UserRole = transaction.mutations[0].modified;
      await fetch(`/api/data/user-roles`, {
        method: "POST",
        body: JSON.stringify(newUserRole),
      });
    },
    onDelete: async ({ transaction }) => {
      const deletedUserRole: UserRole = transaction.mutations[0].original;
      await fetch(`/api/data/user-roles`, {
        method: "DELETE",
        body: JSON.stringify(deletedUserRole),
      });
    },
  }),
);
