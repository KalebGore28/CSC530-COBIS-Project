import { instructorCourses } from "../../schema";
import type { ApolloContext } from '@/middleware/apollo-server-context';

type InstructorCourse = typeof instructorCourses.$inferSelect;

export const instructorCourseTypeExtension = /* GraphQL */ `
  extend type InstructorCoursesSelectItem {
    term: Term!
    course: CoursesSelectItem!
    students: [StudentsSelectItem!]!
    total_students: Int!
    total_credit_hours: Int!
    credit_hour: Float
    class_gpa: Float
    midterm_average: Float
    final_average: Float
    # midterm_grade_distribution: [InstructorCourseGradeDistributionItem!]!
    # final_grade_distribution: [InstructorCourseGradeDistributionItem!]!
  }
`;

export const InstructorCourseResolver = {
    term: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.term.load(instructorCourse.term_code),
    course: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.course.load(
            [
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    students: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.studentsByCourse.load(
            [
                instructorCourse.term_code,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    total_students: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.totalStudentsByCourse.load(
            [
                instructorCourse.term_code,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),

    total_credit_hours: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.totalCreditHoursByCourse.load(
            [
                instructorCourse.term_code,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    credit_hour: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.creditHourByCourse.load(
            [
                instructorCourse.term_code,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    class_gpa: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.classGpaByCourse.load(
            [
                instructorCourse.term_code,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    midterm_average: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.midtermAverageByCourse.load(
            [
                instructorCourse.term_code,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    final_average: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.finalAverageByCourse.load(
            [
                instructorCourse.term_code,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    // midterm_grade_distribution: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
    //     loaders.midtermGradeDistributionByCourse.load(
    //         [
    //             instructorCourse.term_code,
    //             instructorCourse.year,
    //             instructorCourse.course_subject,
    //             instructorCourse.course_number,
    //             instructorCourse.course_suffix,
    //         ].join('|')
    //     ),
    // final_grade_distribution: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
    //     loaders.finalGradeDistributionByCourse.load(
    //         [
    //             instructorCourse.term_code,
    //             instructorCourse.year,
    //             instructorCourse.course_subject,
    //             instructorCourse.course_number,
    //             instructorCourse.course_suffix,
    //         ].join('|')
    //     ),
};