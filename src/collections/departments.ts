import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { departments } from '@/db/schema'

type Department = typeof departments.$inferSelect

export const departmentsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['departments'],
        queryFn: async () => {
            const response = await fetch(`/api/data/departments`)
            return await response.json() as Department[]
        },
        getKey: (department) => department.code,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    })
)