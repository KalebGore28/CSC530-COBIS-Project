import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { studentAdvisors } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollectionSubset } from "./api";

type StudentAdvisor = typeof studentAdvisors.$inferSelect;

export const studentAdvisorsCollection = collectionOptions("studentAdvisor", (client) =>
  queryCollectionOptions({
    queryKey: ["studentAdvisors"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: (context) => fetchCollectionSubset<StudentAdvisor>("student-advisors", context),
    syncMode: "on-demand",
    getKey: (studentAdvisor) =>
      `${studentAdvisor.mnumber}-${studentAdvisor.term_id}-${studentAdvisor.year}`,
  }),
);
