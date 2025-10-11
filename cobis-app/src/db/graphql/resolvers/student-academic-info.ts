import type { StudentAcademicInfo } from "../../db/schema";
import { ApolloContext } from "../../app";

export const StudentAcademicInfoResolver = {
    term: (academicInfo: StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
        loaders.term.load(academicInfo.term),
    admit_term: (academicInfo: StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
        loaders.term.load(academicInfo.admit_term),
    admit_code: (academicInfo: StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
        loaders.admitCode.load(academicInfo.admit_code),
    academic_standing: (academicInfo: StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
        loaders.academicStanding.load(academicInfo.academic_standing),
    student: (academicInfo: StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
        loaders.student.load(academicInfo.mnumber),
};