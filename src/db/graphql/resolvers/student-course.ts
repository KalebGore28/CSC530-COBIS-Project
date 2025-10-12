import { studentCourses} from "../../schema";
import type { ApolloContext } from '@/middleware/apollo-server-context';

type StudentCourse = typeof studentCourses.$inferSelect;


export const studentCoursesTypeExtension = /* GraphQL */ `
  extend type StudentCoursesSelectItem {
    term: TermsSelectItem!
    part_of_term: PartOfTermSelectItem
    course: CoursesSelectItem!
    registration_status: RegistrationStatusSelectItem
    instructional_method: InstructionalMethodsSelectItem
    student: StudentsSelectItem!
  }
`;

export const StudentCoursesResolver = {
    term: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.term.load(studentCourse.term_code),
    part_of_term: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.partOfTerm.load(studentCourse.part_of_term_code || ''),
    course: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.course.load(
            `${studentCourse.course_subject}|${studentCourse.course_number}|${studentCourse.course_suffix}`
        ),
    registration_status: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.registrationStatus.load(studentCourse.registration_status_code || ''),
    instructional_method: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.instructionalMethod.load(studentCourse.instructional_method_code || ''),
    student: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.student.load(studentCourse.mnumber),
};