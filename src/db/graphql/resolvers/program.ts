import { programs } from '../../schema'
import type { ApolloContext } from '@/middleware/apollo-server-context';

type Program = typeof programs.$inferSelect;

export const programTypeExtension = /* GraphQL */ `
  extend type ProgramsSelectItem {
    department: DepartmentsSelectItem
    college: CollegesSelectItem
    student_programs(
      startTerm: String!
      startYear: Int!
      endTerm: String!
      endYear: Int!
    ): [StudentProgramsSelectItem]
  }
`;

export const ProgramResolver = {
  department: (program: Program, _args: any, { loaders }: ApolloContext) =>
    loaders.department.load(program.department_code || ''),
  college: (program: Program, _args: any, { loaders }: ApolloContext) =>
    loaders.college.load(program.college_code || ''),
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
