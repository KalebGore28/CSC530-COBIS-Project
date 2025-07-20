import type { StudentCourse } from "../../db/schema";
import { ApolloContext } from "../../app";

export const StudentCoursesResolver = {
    term: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.term.load(studentCourse.term),
    part_of_term: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.partOfTerm.load(studentCourse.part_of_term),
    course: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.course.load(
            `${studentCourse.course_subject}|${studentCourse.course_number}|${studentCourse.course_suffix}`
        ),
    registration_status: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.registrationStatus.load(studentCourse.registration_status),
    instructional_method: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.instructionalMethod.load(studentCourse.instructional_method),
    student: (studentCourse: StudentCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.student.load(studentCourse.mnumber),
};