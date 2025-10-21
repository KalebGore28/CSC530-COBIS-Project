import { studentPrograms } from "../../db/schema";
import type { ApolloContext } from '@/middleware/apollo-server-context';

type StudentProgram = typeof studentPrograms.$inferSelect;

export const studentProgramTypeExtension = /* GraphQL */ `
  extend type StudentProgramsSelectItem {
    term: TermsSelectItem!
    program: ProgramsSelectItem!
    student: StudentsSelectItem!
  }
`;

export const StudentProgramsResolver = {
  term: (studentProgram: StudentProgram, _args: any, { loaders }: ApolloContext) =>
    loaders.term.load(studentProgram.term_code),
  program: (studentProgram: StudentProgram, _args: any, { loaders }: ApolloContext) =>
    loaders.program.load(studentProgram.program_code),
  student: (studentProgram: StudentProgram, _args: any, { loaders }: ApolloContext) =>
    loaders.student.load(studentProgram.mnumber),
};