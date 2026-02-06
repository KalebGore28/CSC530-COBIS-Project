import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { studentCourses } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type StudentCourse = typeof studentCourses.$inferSelect

export const studentCoursesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['studentCourses'],
        queryFn: async () => {
            const response = await fetch(`/api/data/student-courses`)
            return (await response.json()) as Array<StudentCourse>
        },
        getKey: (studentCourse) =>
            `${studentCourse.mnumber}-${studentCourse.term_id}-${studentCourse.year}-${studentCourse.course_id}-${studentCourse.course_section}`,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour
    }),
)
