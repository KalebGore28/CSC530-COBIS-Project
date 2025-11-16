import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { userRoles } from '@/db/schema'

type UserRole = typeof userRoles.$inferSelect

export const userRolesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['user-roles'],
        queryFn: async () => {
            const response = await fetch(`/api/data/user-roles`)
            return await response.json() as UserRole[]
        },
        getKey: (userRole) => `${userRole.user_id}-${userRole.role_id}`,
        queryClient: getQueryClient(),
    })
)