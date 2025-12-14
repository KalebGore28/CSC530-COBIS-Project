import { queryOptions } from '@tanstack/react-query'
import { getAuthUser } from '@/functions/get-auth-user'

export const authQuery = {
    all: ['auth'],
    user: () =>
        queryOptions({
            queryKey: [...authQuery.all, 'user'],
            queryFn: async () => {
                const session = await getAuthUser()
                return session
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
        }),
}
