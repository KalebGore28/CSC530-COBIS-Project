import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { studentAdvisors } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type StudentAdvisor = typeof studentAdvisors.$inferSelect;

export const studentAdvisorsCollection = collectionOptions(
  "studentAdvisor",
  (client) =>
    queryCollectionOptions({
      queryKey: ["studentAdvisors"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      queryFn: async () => {
        const response = await fetch(`/api/data/student-advisors`);
        return (await response.json()) as Array<StudentAdvisor>;
      },
      autoIndex: "eager",
      syncMode: "on-demand",
      getKey: (studentAdvisor) =>
        `${studentAdvisor.mnumber}-${studentAdvisor.term_id}-${studentAdvisor.year}`,
    }),
);
