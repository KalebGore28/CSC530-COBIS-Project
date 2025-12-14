import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { instructionalMethods } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type InstructionalMethod = typeof instructionalMethods.$inferSelect

export const instructionalMethodsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['instructionalMethods'],
        queryFn: async () => {
            const response = await fetch(`/api/data/instructional-methods`)
            return (await response.json()) as Array<InstructionalMethod>
        },
        getKey: (method) => method.code,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    }),
)
