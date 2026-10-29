import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { studentPrograms } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type StudentProgram = typeof studentPrograms.$inferSelect;

export const studentProgramsCollection = collectionOptions(
  "studentProgram",
  (client) =>
    queryCollectionOptions({
      queryKey: ["studentPrograms"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      queryFn: async () => {
        const response = await fetch(`/api/data/student-programs`);
        return (await response.json()) as Array<StudentProgram>;
      },
      autoIndex: "eager",
      syncMode: "on-demand",
      getKey: (studentProgram) =>
        `${studentProgram.mnumber}-${studentProgram.term_id}-${studentProgram.year}-${studentProgram.program_id}`,
    }),
);
