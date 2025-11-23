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
        staleTime: 1000 * 60 * 5, // 5 minutes. Faculty data may change more frequently
        onUpdate: async ({ transaction }) => {
            const { original, modified } = transaction.mutations[0]
            await fetch(`/api/data/faculty`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...modified, // only modify department and college to be modified
                    mnumber: original.mnumber,
                    first_name: original.first_name,
                    last_name: original.last_name,
                }),
            })
        }
    })
)