import { createCollection, BasicIndex } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { students } from "@/db/schema";
import { getQueryClient } from "@/integrations/tanstack-query/provider";

type Student = typeof students.$inferSelect;

export const studentsCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await fetch(`/api/data/students`);
      return (await response.json()) as Array<Student>;
    },
    getKey: (student) => student.mnumber,
    queryClient: getQueryClient(),
    defaultIndexType: BasicIndex,
    autoIndex: "eager",
    staleTime: 1000 * 60 * 60, // 1 hour
  }),
);
