import type { StudentProgram } from "../../db/schema";
import { ApolloContext } from "../../app";

export const StudentProgramResolver = {
    term: (studentProgram: StudentProgram, _args: any, { loaders }: ApolloContext) =>
        loaders.term.load(studentProgram.term),
    program: (studentProgram: StudentProgram, _args: any, { loaders }: ApolloContext) =>
        loaders.program.load(studentProgram.program),
    student: (studentProgram: StudentProgram, _args: any, { loaders }: ApolloContext) =>
        loaders.student.load(studentProgram.mnumber),
};