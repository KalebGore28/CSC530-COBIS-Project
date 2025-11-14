import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { faculty } from '@/db/schema'

type Faculty = typeof faculty.$inferSelect

export const facultyCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['faculty'],
        queryFn: async () => {
            const response = await fetch(`/api/data/faculty`)
            return await response.json() as Faculty[]
        },
        getKey: (faculty) => faculty.mnumber,
        queryClient: getQueryClient(),
    })
)