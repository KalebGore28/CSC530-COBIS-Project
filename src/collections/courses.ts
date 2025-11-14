import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { courses } from '@/db/schema'

type Course = typeof courses.$inferSelect

export const coursesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['courses'],
        queryFn: async () => {
            const response = await fetch(`/api/data/courses`)
            return await response.json() as Course[]
        },
        getKey: (course) => `${course.subject}${course.number}${course.suffix || ''}`,
        queryClient: getQueryClient(),
    })
)