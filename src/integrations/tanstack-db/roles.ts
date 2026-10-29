import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { roles } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type Role = typeof roles.$inferSelect;

export const rolesCollection = collectionOptions("roles", (client) =>
  queryCollectionOptions({
    queryKey: ["roles"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/roles`);
      return (await response.json()) as Array<Role>;
    },
    autoIndex: "eager",
    getKey: (role) => role.id,
  }),
);
