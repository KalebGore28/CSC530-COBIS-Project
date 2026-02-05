import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { academicStanding } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type AcademicStanding = typeof academicStanding.$inferSelect

export const academicStandingCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['academicStanding'],
        queryFn: async () => {
            const response = await fetch('/api/data/academic-standing')
            return (await response.json()) as Array<AcademicStanding>
        },
        getKey: (standing) => standing.id,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    }),
)
