import {studentAdvisors}from "../../schema";
import type { ApolloContext } from '@/middleware/apollo-server-context';

type StudentAdvisor = typeof studentAdvisors.$inferSelect;

export const studentAdvisorTypeExtension = /* GraphQL */ `
  extend type StudentAdvisorsSelectItem {
    term: TermsSelectItem!
    student: StudentsSelectItem!
    advisor: FacultySelectItem!
  }
`;

export const StudentAdvisorResolver = {
    term: (studentAdvisor: StudentAdvisor, _args: any, { loaders }: ApolloContext) =>
        loaders.term.load(studentAdvisor.term_code),
    student: (studentAdvisor: StudentAdvisor, _args: any, { loaders }: ApolloContext) =>
        loaders.student.load(studentAdvisor.student_mnumber),
    advisor: (studentAdvisor: StudentAdvisor, _args: any, { loaders }: ApolloContext) =>
        loaders.faculty.load(studentAdvisor.advisor_mnumber),
};