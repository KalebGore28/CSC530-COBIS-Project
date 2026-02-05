import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { partOfTerm } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type PartOfTerm = typeof partOfTerm.$inferSelect

export const partOfTermCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['partOfTerm'],
        queryFn: async () => {
            const response = await fetch(`/api/data/part-of-term`)
            return (await response.json()) as Array<PartOfTerm>
        },
        getKey: (partOfTerm) => partOfTerm.id,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    }),
)
