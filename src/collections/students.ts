import { createCollection, parseLoadSubsetOptions } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { students } from '@/db/schema'

type Student = typeof students.$inferSelect

export const studentsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['students'],
        queryFn: async (ctx) => {
            const { filters, sorts, limit } = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions as any)

            const params = new URLSearchParams()
            
            filters.forEach(({ field, operator, value }) => {
                params.set(`${field.join('.')}_${operator}`, String(value))
            })

            sorts.forEach(({ field, direction, nulls }) => {
                let sortParam = field.join('.')
                if (direction) sortParam += `:${direction}`
                if (nulls) sortParam += `:${nulls}`
                params.append('sort', sortParam)
            })

            if (limit) params.set('limit', String(limit))

            const response = await fetch(`/api/data/students?${params}`)
            return (await response.json()) as Student[]
        },
        getKey: (student) => student.mnumber,
        queryClient: getQueryClient(),
        syncMode: 'on-demand'
    })
)