import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { terms } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { LOOKUP_STALE_TIME } from "./stale-times";

type Term = typeof terms.$inferSelect;

export const termsCollection = collectionOptions("term", (client) =>
  queryCollectionOptions({
    queryKey: ["terms"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: LOOKUP_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: async () => {
      const response = await fetch(`/api/data/terms`);
      return (await response.json()) as Array<Term>;
    },
    getKey: (term) => term.id,
  }),
);
