import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { userRoles } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type UserRole = typeof userRoles.$inferSelect

export const userRolesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['user-roles'],
        queryFn: async () => {
            const response = await fetch(`/api/data/user-roles`)
            return (await response.json()) as Array<UserRole>
        },
        getKey: (userRole) => `${userRole.user_id}-${userRole.role_id}`,
        queryClient: getQueryClient(),
        onInsert: async ({ transaction }) => {
            const newUserRole: UserRole = transaction.mutations[0].modified
            await fetch(`/api/data/user-roles`, {
                method: 'POST',
                body: JSON.stringify(newUserRole),
            })
        },
        onDelete: async ({ transaction }) => {
            const deletedUserRole: UserRole = transaction.mutations[0].original
            await fetch(`/api/data/user-roles`, {
                method: 'DELETE',
                body: JSON.stringify(deletedUserRole),
            })
        },
    }),
)
