import { createCollection, parseLoadSubsetOptions } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { studentAdvisors } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type StudentAdvisor = typeof studentAdvisors.$inferSelect

export const studentAdvisorsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['studentAdvisors'],
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

            const response = await fetch(`/api/data/student-advisors?${params}`)
            return (await response.json()) as Array<StudentAdvisor>
        },
        getKey: (studentAdvisor) =>
            `${studentAdvisor.advisor_mnumber}-${studentAdvisor.student_mnumber}-${studentAdvisor.term_code}-${studentAdvisor.year}`,
        queryClient: getQueryClient(),
        syncMode: 'on-demand',
        staleTime: 1000 * 60 * 5, // 5 minutes
    }),
)
