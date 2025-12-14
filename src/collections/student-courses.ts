import { createCollection, parseLoadSubsetOptions } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { studentCourses } from '@/db/schema'
import { getQueryClient } from '@/providers/queryClient'

type StudentCourse = typeof studentCourses.$inferSelect

export const studentCoursesCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['studentCourses'],
        queryFn: async (ctx) => {
            const { filters, sorts, limit } = parseLoadSubsetOptions(
                ctx.meta?.loadSubsetOptions as any,
            )

            const params = new URLSearchParams()

            filters.forEach(({ field, operator, value }) => {
                params.set(`${field.join('.')}_${operator}`, String(value))
            })

            sorts.forEach(({ field, direction, nulls }) => {
                const sortParam = `${field.join('.')}:${direction}:${nulls}`
                params.append('sort', sortParam)
            })

            if (limit) params.set('limit', String(limit))

            const response = await fetch(`/api/data/student-courses?${params}`)
            return (await response.json()) as Array<StudentCourse>
        },
        getKey: (studentCourse) =>
            `${studentCourse.mnumber}-${studentCourse.term_code}-${studentCourse.year}-${studentCourse.course_id}-${studentCourse.course_section}`,
        queryClient: getQueryClient(),
        syncMode: 'on-demand',
        staleTime: 1000 * 60 * 5, // 5 minutes
    }),
)
