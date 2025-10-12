import type { StudentAdvisor } from "../../db/schema";
import { ApolloContext } from "../../app";

export const StudentAdvisorResolver = {
    term: (studentAdvisor: StudentAdvisor, _args: any, { loaders }: ApolloContext) =>
        loaders.term.load(studentAdvisor.term),
    student: (studentAdvisor: StudentAdvisor, _args: any, { loaders }: ApolloContext) =>
        loaders.student.load(studentAdvisor.student_mnumber),
    advisor: (studentAdvisor: StudentAdvisor, _args: any, { loaders }: ApolloContext) =>
        loaders.faculty.load(studentAdvisor.advisor_mnumber),
};