import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { colleges } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type College = typeof colleges.$inferSelect

export const collegesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['colleges'],
        queryFn: async () => {
            const response = await fetch(`/api/data/colleges`)
            return (await response.json()) as Array<College>
        },
        getKey: (college) => college.id,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
        onUpdate: async ({ transaction }) => {
            const { original, modified } = transaction.mutations[0]
            await fetch(`/api/data/colleges`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...modified,
                    id: original.id,
                }),
            })
        },
    }),
)
