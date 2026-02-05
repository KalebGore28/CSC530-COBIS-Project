import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { courses } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type Course = typeof courses.$inferSelect

export const coursesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['courses'],
        queryFn: async () => {
            const response = await fetch(`/api/data/courses`)
            return (await response.json()) as Array<Course>
        },
        getKey: (course) => course.id,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour. Not expected to change hardly ever
    }),
)
