import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { roles } from '@/db/schema'

type Role = typeof roles.$inferSelect

export const rolesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['roles'],
        queryFn: async () => {
            const response = await fetch(`/api/data/roles`)
            return await response.json() as Role[]
        },
        getKey: (role) => role.id,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    })
)