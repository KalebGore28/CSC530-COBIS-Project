import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { programs } from '@/db/schema'

type Program = typeof programs.$inferSelect

export const programsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['programs'],
        queryFn: async () => {
            const response = await fetch(`/api/programs`)
            return await response.json() as Program[]
        },
        getKey: (program) => program.code,
        queryClient: getQueryClient(),
    })
)