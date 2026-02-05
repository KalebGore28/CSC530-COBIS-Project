import { createCollection, parseLoadSubsetOptions } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { studentAcademicInfo } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type StudentAcademicInfo = typeof studentAcademicInfo.$inferSelect

export const studentAcademicInfoCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['studentAcademicInfo'],
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

            const response = await fetch(
                `/api/data/student-academic-info?${params}`,
            )
            return (await response.json()) as Array<StudentAcademicInfo>
        },
        getKey: (studentInfo) =>
            `${studentInfo.mnumber}-${studentInfo.term_id}-${studentInfo.year}`,
        queryClient: getQueryClient(),
        syncMode: 'on-demand',
        staleTime: 1000 * 60 * 5, // 5 minutes
    }),
)
