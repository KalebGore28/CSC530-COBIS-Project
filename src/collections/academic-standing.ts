import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { academicStanding } from '@/db/schema'

type AcademicStanding = typeof academicStanding.$inferSelect

export const academicStandingCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['academicStanding'],
        queryFn: async () => {
            const response = await fetch(`/api/data/academic-standing`)
            return await response.json() as AcademicStanding[]
        },
        getKey: (standing) => standing.code,
        queryClient: getQueryClient(),
    })
)