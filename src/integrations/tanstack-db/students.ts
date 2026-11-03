import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { students } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollectionSubset } from "./api";
import { RECORD_STALE_TIME } from "./stale-times";

type Student = typeof students.$inferSelect;

export const studentsCollection = collectionOptions("student", (client) =>
  queryCollectionOptions({
    queryKey: ["students"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: RECORD_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: (context) => fetchCollectionSubset<Student>("students", context),
    syncMode: "on-demand",
    getKey: (student) => student.mnumber,
  }),
);
