import { createCollection, parseLoadSubsetOptions } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { studentPrograms } from '@/db/schema'

type StudentProgram = typeof studentPrograms.$inferSelect

export const studentProgramsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['studentPrograms'],
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

            const response = await fetch(`/api/data/student-programs?${params}`)
            return await response.json() as StudentProgram[]
        },
        getKey: (studentProgram) => `${studentProgram.mnumber}-${studentProgram.type}-${studentProgram.program_code}`,
        queryClient: getQueryClient(),
        // syncMode: 'on-demand'
    })
)