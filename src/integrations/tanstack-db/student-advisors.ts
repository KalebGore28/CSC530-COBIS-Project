import { createCollection, BasicIndex } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { studentAdvisors } from "@/db/schema";
import { getQueryClient } from "@/integrations/tanstack-query/provider";

type StudentAdvisor = typeof studentAdvisors.$inferSelect;

export const studentAdvisorsCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["studentAdvisors"],
    queryFn: async () => {
      const response = await fetch(`/api/data/student-advisors`);
      return (await response.json()) as Array<StudentAdvisor>;
    },
    getKey: (studentAdvisor) =>
      `${studentAdvisor.mnumber}-${studentAdvisor.term_id}-${studentAdvisor.year}`,
    queryClient: getQueryClient(),
    defaultIndexType: BasicIndex,
    autoIndex: "eager",
    staleTime: 1000 * 60 * 60, // 1 hour
  }),
);
