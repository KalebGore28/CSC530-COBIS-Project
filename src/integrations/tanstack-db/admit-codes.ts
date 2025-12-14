import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { admitCodes } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type AdmitCode = typeof admitCodes.$inferSelect

export const admitCodesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['admitCodes'],
        queryFn: async () => {
            const response = await fetch(`/api/data/admit-codes`)
            return (await response.json()) as Array<AdmitCode>
        },
        getKey: (code) => code.code,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    }),
)
