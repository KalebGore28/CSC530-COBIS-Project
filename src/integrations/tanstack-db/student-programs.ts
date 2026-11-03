import { BasicIndex, collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { studentPrograms } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollectionSubset } from "./api";
import { RECORD_STALE_TIME } from "./stale-times";

type StudentProgram = typeof studentPrograms.$inferSelect;

export const studentProgramsCollection = collectionOptions("studentProgram", (client) =>
  queryCollectionOptions({
    queryKey: ["studentPrograms"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    staleTime: RECORD_STALE_TIME,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
    queryFn: (context) => fetchCollectionSubset<StudentProgram>("student-programs", context),
    syncMode: "on-demand",
    getKey: (studentProgram) =>
      `${studentProgram.mnumber}-${studentProgram.term_id}-${studentProgram.year}-${studentProgram.program_id}`,
  }),
);
