import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { registrationStatus } from '@/db/schema'
import { getQueryClient } from '@/providers/queryClient'

type RegistrationStatus = typeof registrationStatus.$inferSelect

export const registrationStatusCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['registrationStatus'],
        queryFn: async () => {
            const response = await fetch(`/api/data/registration-status`)
            return (await response.json()) as Array<RegistrationStatus>
        },
        getKey: (status) => status.code,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    }),
)
