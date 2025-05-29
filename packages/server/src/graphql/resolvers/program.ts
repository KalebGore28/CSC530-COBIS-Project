import type { Program } from '../../db/schema'
import { ApolloContext } from '../../app'

export const ProgramResolver = {
  department: (program: Program, _args: any, { loaders }: ApolloContext) =>
    loaders.department.load(program.department),

  college: (program: Program, _args: any, { loaders }: ApolloContext) =>
    loaders.college.load(program.college),

  student_programs: async (
    program: Program,
    args: { startTerm: string; startYear: number; endTerm: string; endYear: number },
    { loaders }: ApolloContext
  ) => {
    const { startTerm, startYear, endTerm, endYear } = args

    // grab (or create) exactly one DataLoader per range
    const loader = loaders.getStudentProgramsLoader(
      startTerm,
      startYear,
      endTerm,
      endYear
    )

    // returns Promise<StudentProgram[]> — batched & cached per request
    return loader.load(program.code)
  },
}
