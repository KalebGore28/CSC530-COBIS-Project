import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { roles } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection } from "./api";

type Role = typeof roles.$inferSelect;

export const rolesCollection = collectionOptions("roles", (client) =>
  queryCollectionOptions({
    queryKey: ["roles"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: () => fetchCollection<Role>("roles"),
    getKey: (role) => role.id,
  }),
);
