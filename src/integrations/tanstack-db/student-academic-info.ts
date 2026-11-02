import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { studentAcademicInfo } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollectionSubset } from "./api";

type StudentAcademicInfo = typeof studentAcademicInfo.$inferSelect;

export const studentAcademicInfoCollection = collectionOptions("studentAcademicInfo", (client) =>
  queryCollectionOptions({
    queryKey: ["studentAcademicInfo"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: (context) =>
      fetchCollectionSubset<StudentAcademicInfo>("student-academic-info", context),
    syncMode: "on-demand",
    getKey: (studentInfo) => `${studentInfo.mnumber}-${studentInfo.term_id}-${studentInfo.year}`,
  }),
);
