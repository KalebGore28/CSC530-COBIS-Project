import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { students } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type Student = typeof students.$inferSelect;

export const studentsCollection = collectionOptions("student", (client) =>
  queryCollectionOptions({
    queryKey: ["students"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/students`);
      return (await response.json()) as Array<Student>;
    },
    autoIndex: "eager",
    syncMode: "on-demand",
    getKey: (student) => student.mnumber,
  }),
);
