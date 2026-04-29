import { createCollection, BasicIndex } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { studentAcademicInfo } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type StudentAcademicInfo = typeof studentAcademicInfo.$inferSelect

export const studentAcademicInfoCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['studentAcademicInfo'],
        queryFn: async () => {
            const response = await fetch(`/api/data/student-academic-info`)
            return (await response.json()) as Array<StudentAcademicInfo>
        },
        getKey: (studentInfo) =>
            `${studentInfo.mnumber}-${studentInfo.term_id}-${studentInfo.year}`,
        queryClient: getQueryClient(),
        defaultIndexType: BasicIndex,
        autoIndex: 'eager',
        staleTime: 1000 * 60 * 60, // 1 hour
    }),
)
