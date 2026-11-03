import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { studentAcademicInfo } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollectionSubset } from "./api";
import { RECORD_STALE_TIME } from "./stale-times";

type StudentAcademicInfo = typeof studentAcademicInfo.$inferSelect;

export const studentAcademicInfoCollection = collectionOptions("studentAcademicInfo", (client) =>
  queryCollectionOptions({
    queryKey: ["studentAcademicInfo"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: RECORD_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: (context) =>
      fetchCollectionSubset<StudentAcademicInfo>("student-academic-info", context),
    syncMode: "on-demand",
    getKey: (studentInfo) => `${studentInfo.mnumber}-${studentInfo.term_id}-${studentInfo.year}`,
  }),
);
