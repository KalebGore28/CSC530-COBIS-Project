import { createCollection, BasicIndex } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { departments } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type Department = typeof departments.$inferSelect

export const departmentsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['departments'],
        queryFn: async () => {
            const response = await fetch(`/api/data/departments`)
            return (await response.json()) as Array<Department>
        },
        getKey: (department) => department.id,
        queryClient: getQueryClient(),
        defaultIndexType: BasicIndex,
        autoIndex: 'eager',
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
        onUpdate: async ({ transaction }) => {
            await Promise.all(
                transaction.mutations.map((mutation) =>
                    fetch(`/api/data/departments`, {
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
