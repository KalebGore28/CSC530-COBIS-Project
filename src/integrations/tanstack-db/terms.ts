import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { terms } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type Term = typeof terms.$inferSelect;

export const termsCollection = collectionOptions("term", (client) =>
  queryCollectionOptions({
    queryKey: ["terms"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/terms`);
      return (await response.json()) as Array<Term>;
    },
    autoIndex: "eager",
    getKey: (term) => term.id,
  }),
);
