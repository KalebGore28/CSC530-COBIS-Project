import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { terms } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type Term = typeof terms.$inferSelect

export const termsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['terms'],
        queryFn: async () => {
            const response = await fetch(`/api/data/terms`)
            return (await response.json()) as Array<Term>
        },
        getKey: (term) => term.code,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    }),
)
