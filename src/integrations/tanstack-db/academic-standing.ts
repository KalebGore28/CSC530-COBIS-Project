import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { academicStanding } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection, updateCollectionItem } from "./api";

type AcademicStanding = typeof academicStanding.$inferSelect;

export const academicStandingCollection = collectionOptions("academicStanding", (client) =>
  queryCollectionOptions<AcademicStanding>({
    id: "academicStanding",
    queryKey: ["academicStanding"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: () => fetchCollection<AcademicStanding>("academic-standing"),
    getKey: (standing) => standing.id,
    onUpdate: async ({ transaction, collection }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCollectionItem<AcademicStanding>(
            "academic-standing",
            mutation.original,
            mutation.changes,
          ),
        ),
      );
      await collection.utils.refetch();
    },
  }),
);
