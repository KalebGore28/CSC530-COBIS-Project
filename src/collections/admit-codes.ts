import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { admitCodes } from '@/db/schema'

type AdmitCode = typeof admitCodes.$inferSelect

export const admitCodesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['admitCodes'],
        queryFn: async () => {
            const response = await fetch(`/api/data/admit-codes`)
            return await response.json() as AdmitCode[]
        },
        getKey: (code) => code.code,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    })
)