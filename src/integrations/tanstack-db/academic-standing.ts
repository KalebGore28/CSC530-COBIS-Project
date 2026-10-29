import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { academicStanding } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type AcademicStanding = typeof academicStanding.$inferSelect;

export const academicStandingCollection = collectionOptions("academicStanding", (client) =>
  queryCollectionOptions({
    id: "academicStanding",
    queryKey: ["academicStanding"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch("/api/data/academic-standing");
      return (await response.json()) as Array<AcademicStanding>;
    },
    getKey: (standing) => standing.id,
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          fetch(`/api/data/academic-standing`, {
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
