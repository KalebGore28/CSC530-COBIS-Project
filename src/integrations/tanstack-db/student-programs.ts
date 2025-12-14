import { createCollection, parseLoadSubsetOptions } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { studentPrograms } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type StudentProgram = typeof studentPrograms.$inferSelect

export const studentProgramsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['studentPrograms'],
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

            const response = await fetch(`/api/data/student-programs?${params}`)
            return (await response.json()) as Array<StudentProgram>
        },
        getKey: (studentProgram) =>
            `${studentProgram.mnumber}-${studentProgram.type}-${studentProgram.program_code}`,
        queryClient: getQueryClient(),
        syncMode: 'on-demand',
        staleTime: 1000 * 60 * 5, // 5 minutes
    }),
)
