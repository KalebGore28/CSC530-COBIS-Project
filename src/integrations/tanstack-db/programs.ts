import { createCollection, BasicIndex } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { programs } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type Program = typeof programs.$inferSelect

export const programsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['programs'],
        queryFn: async () => {
            const response = await fetch(`/api/data/programs`)
            return (await response.json()) as Array<Program>
        },
        getKey: (program) => program.id,
        queryClient: getQueryClient(),
        defaultIndexType: BasicIndex,
        autoIndex: 'eager',
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
        onUpdate: async ({ transaction }) => {
            await Promise.all(
                transaction.mutations.map((mutation) =>
                    fetch(`/api/data/programs`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            id: mutation.original.id,
                            ...mutation.changes,
                        }),
                    }),
                ),
            )
        },
    }),
)
