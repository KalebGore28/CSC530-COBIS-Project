import { createCollection, BasicIndex } from '@tanstack/react-db'
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
            `${studentProgram.mnumber}-${studentProgram.term_id}-${studentProgram.year}-${studentProgram.program_id}`,
        queryClient: getQueryClient(),
        defaultIndexType: BasicIndex,
        autoIndex: 'eager',
        staleTime: 1000 * 60 * 60, // 1 hour
    }),
)
