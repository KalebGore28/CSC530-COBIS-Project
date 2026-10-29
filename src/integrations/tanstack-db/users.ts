import { createCollection, BasicIndex } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { user } from "@/db/schema";
import { getQueryClient } from "@/integrations/tanstack-query/provider";

type User = typeof user.$inferSelect;

export const usersCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch(`/api/data/users`);
      return (await response.json()) as Array<User>;
    },
    getKey: (user) => user.id,
    queryClient: getQueryClient(),
    defaultIndexType: BasicIndex,
    autoIndex: "eager",
    staleTime: 1000 * 60 * 5, // 5 minutes. Users may change more frequently
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
