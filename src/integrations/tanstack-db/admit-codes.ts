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
        getKey: (admitCode) => admitCode.id,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
        onUpdate: async ({ transaction }) => {
            const { original, modified } = transaction.mutations[0]
            await fetch(`/api/data/admit-codes`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...modified,
                    id: original.id,
                }),
            })
        },
    }),
)
