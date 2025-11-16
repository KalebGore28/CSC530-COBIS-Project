import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { nations } from '@/db/schema'

type Nation = typeof nations.$inferSelect

export const nationsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['nations'],
        queryFn: async () => {
            const response = await fetch(`/api/data/nations`)
            return await response.json() as Nation[]
        },
        getKey: (nation) => nation.code,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    })
)