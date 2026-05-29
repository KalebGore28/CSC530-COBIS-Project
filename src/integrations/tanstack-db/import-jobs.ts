import { createCollection, BasicIndex } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { importJobs } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type ImportJob = typeof importJobs.$inferSelect

export const importJobsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['import-jobs'],
        queryFn: async () => {
            const response = await fetch(`/api/data/import-jobs`)
            return (await response.json()) as Array<ImportJob>
        },
        getKey: (job) => job.id,
        queryClient: getQueryClient(),
        defaultIndexType: BasicIndex,
        autoIndex: 'eager',
        staleTime: 1000 * 60, // 1 minute
    }),
)
