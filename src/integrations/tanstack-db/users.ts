import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { user } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type User = typeof user.$inferSelect;

export const usersCollection = collectionOptions("user", (client) =>
  queryCollectionOptions({
    queryKey: ["users"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/users`);
      return (await response.json()) as Array<User>;
    },
    autoIndex: "eager",
    getKey: (user) => user.id,
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          fetch(`/api/data/users`, {
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
