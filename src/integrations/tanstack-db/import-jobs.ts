import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { importJobs } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";

type ImportJob = typeof importJobs.$inferSelect;

export const importJobsCollection = collectionOptions("importJobs", (client) =>
  queryCollectionOptions({
    queryKey: ["importJobs"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: async () => {
      const response = await fetch(`/api/data/import-jobs`);
      return (await response.json()) as Array<ImportJob>;
    },
    autoIndex: "eager",
    getKey: (job) => job.id,
  }),
);
