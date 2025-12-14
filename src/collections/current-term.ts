import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'

type CurrentTerm = {
    year: number
    term_code: string
}

export const currentTermCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['currentTerm'],
        queryFn: async () => {
            const response = await fetch(`/api/current-term`)
            return (await response.json()) as Array<CurrentTerm>
        },
        getKey: (currentTerm) => `${currentTerm.year}-${currentTerm.term_code}`,
        queryClient: getQueryClient(),
    }),
)
