import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { colleges } from '@/db/schema'
import { getQueryClient } from '@/providers/queryClient'

type College = typeof colleges.$inferSelect

export const collegesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['colleges'],
        queryFn: async () => {
            const response = await fetch(`/api/data/colleges`)
            return (await response.json()) as Array<College>
        },
        getKey: (college) => college.code,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    }),
)
