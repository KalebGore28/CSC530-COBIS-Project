import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { programs } from '@/db/schema'

type Program = typeof programs.$inferSelect

export const programsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['programs'],
        queryFn: async () => {
            const response = await fetch(`/api/data/programs`)
            return await response.json() as Program[]
        },
        getKey: (program) => program.code,
        queryClient: getQueryClient(),
        onUpdate: async ({ transaction }) => {
            const { original, modified } = transaction.mutations[0]
            await fetch(`/api/data/programs`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...modified,
                    code: original.code,
                }),
            })
        }
    })
)