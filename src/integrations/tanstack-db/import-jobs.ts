import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { importJobs } from "@/db/schema";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection } from "./api";

type ImportJob = typeof importJobs.$inferSelect;

export const importJobsCollection = collectionOptions("importJobs", (client) =>
  queryCollectionOptions({
    queryKey: ["importJobs"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: () => fetchCollection<ImportJob>("import-jobs"),
    autoIndex: "eager",
    getKey: (job) => job.id,
  }),
);
