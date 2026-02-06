import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import type { studentPrograms } from '@/db/schema'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type StudentProgram = typeof studentPrograms.$inferSelect

export const studentProgramsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['studentPrograms'],
        queryFn: async () => {
            const response = await fetch(`/api/data/student-programs`)
            return (await response.json()) as Array<StudentProgram>
        },
        getKey: (studentProgram) =>
            `${studentProgram.mnumber}-${studentProgram.type}-${studentProgram.program_id}`,
        queryClient: getQueryClient(),
        staleTime: 1000 * 60 * 60, // 1 hour
    }),
)
