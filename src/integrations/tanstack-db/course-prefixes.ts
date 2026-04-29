import { createCollection, BasicIndex } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { coursePrefixes } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type CoursePrefixes = typeof coursePrefixes.$inferSelect

export const coursePrefixesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['coursePrefixes'],
        queryFn: async () => {
            const response = await fetch(`/api/data/course-prefixes`)
            return (await response.json()) as Array<CoursePrefixes>
        },
        getKey: (prefix) => prefix.id,
        queryClient: getQueryClient(),
        defaultIndexType: BasicIndex,
        autoIndex: 'eager',
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
        onUpdate: async ({ transaction }) => {
            await Promise.all(
                transaction.mutations.map((mutation) =>
                    fetch(`/api/data/course-prefixes`, {
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
