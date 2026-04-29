import { createCollection, BasicIndex } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { courses } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type Course = typeof courses.$inferSelect

export const coursesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['courses'],
        queryFn: async () => {
            const response = await fetch(`/api/data/courses`)
            return (await response.json()) as Array<Course>
        },
        getKey: (course) => course.id,
        queryClient: getQueryClient(),
        defaultIndexType: BasicIndex,
        autoIndex: 'eager',
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
        onUpdate: async ({ transaction }) => {
            await Promise.all(
                transaction.mutations.map((mutation) =>
                    fetch(`/api/data/courses`, {
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
