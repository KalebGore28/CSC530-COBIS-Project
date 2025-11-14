import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { terms } from '@/db/schema'

type Term = typeof terms.$inferSelect

export const termsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['terms'],
        queryFn: async () => {
            const response = await fetch(`/api/data/terms`)
            return await response.json() as Term[]
        },
        getKey: (term) => term.code,
        queryClient: getQueryClient(),
    })
)