import { studentAcademicInfo } from "../../db/schema";
import type { ApolloContext } from '@/middleware/apollo-server-context';

type StudentAcademicInfo = typeof studentAcademicInfo.$inferSelect;

export const studentAcademicInfoTypeExtension = /* GraphQL */ `
  extend type StudentAcademicInfoSelectItem {
    term: TermsSelectItem
    admit_term: AdmitCodesSelectItem
    academic_standing: AcademicStandingSelectItem
    student: StudentsSelectItem
  }
`;

export const StudentAcademicInfoResolver = {
  term: (academicInfo: StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
    loaders.term.load(academicInfo.term_code),
  admit_term: (academicInfo: StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
    loaders.admitCode.load(academicInfo.admit_code || ''),
  academic_standing: (academicInfo: StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
    loaders.academicStanding.load(academicInfo.academic_standing_code || ''),
  student: (academicInfo: StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
    loaders.student.load(academicInfo.mnumber),
};