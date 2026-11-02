import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { students } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollectionSubset } from "./api";

type Student = typeof students.$inferSelect;

export const studentsCollection = collectionOptions("student", (client) =>
  queryCollectionOptions({
    queryKey: ["students"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: (context) => fetchCollectionSubset<Student>("students", context),
    syncMode: "on-demand",
    getKey: (student) => student.mnumber,
  }),
);
