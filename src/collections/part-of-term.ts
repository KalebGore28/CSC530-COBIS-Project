import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { partOfTerm } from '@/db/schema'

type PartOfTerm = typeof partOfTerm.$inferSelect

export const partOfTermCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['partOfTerm'],
        queryFn: async () => {
            const response = await fetch(`/api/data/part-of-term`)
            return await response.json() as PartOfTerm[]
        },
        getKey: (partOfTerm) => partOfTerm.code,
        queryClient: getQueryClient(),
    })
)