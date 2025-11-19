import { createCollection, parseLoadSubsetOptions } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { getQueryClient } from '@/providers/queryClient'
import { studentAcademicInfo } from '@/db/schema'

type StudentAcademicInfo = typeof studentAcademicInfo.$inferSelect

export const studentAcademicInfoCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['studentAcademicInfo'],
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

            const response = await fetch(`/api/data/student-academic-info?${params}`)
            return await response.json() as StudentAcademicInfo[]
        },
        getKey: (studentInfo) => `${studentInfo.mnumber}-${studentInfo.term_code}-${studentInfo.year}`,
        queryClient: getQueryClient(),
        syncMode: 'on-demand',
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
)