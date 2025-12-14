import { createCollection, parseLoadSubsetOptions } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { students } from '@/db/schema'
import { getQueryClient } from '@/providers/queryClient'

type Student = typeof students.$inferSelect

export const studentsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['students'],
        queryFn: async (ctx) => {
            const { filters, sorts, limit } = parseLoadSubsetOptions(
                ctx.meta?.loadSubsetOptions as any,
            )

            const params = new URLSearchParams()

            if (limit) params.set('limit', String(limit))

            filters.forEach(({ field, operator, value }) => {
                params.set(`${field.join('.')}_${operator}`, String(value))
            })

            sorts.forEach(({ field, direction, nulls }) => {
                const sortParam = `${field.join('.')}:${direction}:${nulls}`
                params.append('sort', sortParam)
            })

            const response = await fetch(`/api/data/students?${params}`)
            return (await response.json()) as Array<Student>
        },
        getKey: (student) => student.mnumber,
        queryClient: getQueryClient(),
        syncMode: 'on-demand',
    }),
)
