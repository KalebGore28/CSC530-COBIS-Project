import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/react-query";
import { RECORD_STALE_TIME } from "./stale-times";

type CurrentTerm = {
  year: number;
  term_id: string;
};

export const currentTermCollection = collectionOptions("currentTerm", (client) =>
  queryCollectionOptions({
    queryKey: ["currentTerm"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: RECORD_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: async () => {
      const response = await fetch("/api/current-term");
      return (await response.json()) as Array<CurrentTerm>;
    },
    getKey: (currentTerm) => `${currentTerm.year}-${currentTerm.term_id}`,
  }),
);
