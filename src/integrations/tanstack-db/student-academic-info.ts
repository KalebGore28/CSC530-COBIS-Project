import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { studentAcademicInfo } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type StudentAcademicInfo = typeof studentAcademicInfo.$inferSelect;

export const studentAcademicInfoCollection = collectionOptions(
  "studentAcademicInfo",
  (client) =>
    queryCollectionOptions({
      queryKey: ["studentAcademicInfo"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      queryFn: async () => {
        const response = await fetch(`/api/data/student-academic-info`);
        return (await response.json()) as Array<StudentAcademicInfo>;
      },
      autoIndex: "eager",
      syncMode: "on-demand",
      getKey: (studentInfo) =>
        `${studentInfo.mnumber}-${studentInfo.term_id}-${studentInfo.year}`,
    }),
);
