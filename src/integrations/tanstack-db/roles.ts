import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { roles } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection } from "./api";
import { LOOKUP_STALE_TIME } from "./stale-times";

type Role = typeof roles.$inferSelect;

export const rolesCollection = collectionOptions("roles", (client) =>
  queryCollectionOptions({
    queryKey: ["roles"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: LOOKUP_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: () => fetchCollection<Role>("roles"),
    getKey: (role) => role.id,
  }),
);
