import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { faculty } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type Faculty = typeof faculty.$inferSelect

export const facultyCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['faculty'],
        queryFn: async () => {
            const response = await fetch(`/api/data/faculty`)
            return (await response.json()) as Array<Faculty>
        },
        getKey: (faculty) => faculty.mnumber,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 5, // 5 minutes. Faculty data may change more frequently
        onUpdate: async ({ transaction }) => {
            await Promise.all(
                transaction.mutations.map((mutation) =>
                    fetch(`/api/data/faculty`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            mnumber: mutation.original.mnumber,
                            first_name: mutation.original.first_name,
                            last_name: mutation.original.last_name,
                            ...mutation.changes,
                        }),
                    }),
                ),
            )
        },
    }),
)
