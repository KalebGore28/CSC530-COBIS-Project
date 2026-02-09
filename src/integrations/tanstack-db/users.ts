import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { user } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type User = typeof user.$inferSelect

export const usersCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await fetch(`/api/data/users`)
            return (await response.json()) as Array<User>
        },
        getKey: (user) => user.id,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 5, // 5 minutes. Users may change more frequently
        onUpdate: async ({ transaction }) => {
            const { original, modified } = transaction.mutations[0]
            await fetch(`/api/data/users`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...modified, // only modify roles to be modified
                    id: original.id,
                    name: original.name,
                    email: original.email,
                    emailVerified: original.emailVerified,
                    image: original.image,
                    createdAt: new Date(original.createdAt),
                    updatedAt: new Date(), // update updatedAt to current time
                    lastLogin: original.lastLogin,
                }),
            })
        },
    }),
)
