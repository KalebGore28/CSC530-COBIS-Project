import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/react-query";

type CurrentTerm = {
  year: number;
  term_id: string;
};

export const currentTermCollection = collectionOptions(
  "currentTerm",
  (client) =>
    queryCollectionOptions({
      queryKey: ["currentTerm"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      queryFn: async () => {
        const response = await fetch("/api/current-term");
        return (await response.json()) as Array<CurrentTerm>;
      },
      getKey: (currentTerm) => `${currentTerm.year}-${currentTerm.term_id}`,
      autoIndex: "eager",
    }),
);
