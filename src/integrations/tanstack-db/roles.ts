import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { roles } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type Role = typeof roles.$inferSelect

export const rolesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['roles'],
        queryFn: async () => {
            const response = await fetch(`/api/data/roles`)
            return (await response.json()) as Array<Role>
        },
        getKey: (role) => role.id,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    }),
)
