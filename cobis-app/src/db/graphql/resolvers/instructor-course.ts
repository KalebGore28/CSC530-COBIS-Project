import type { InstructorCourse } from "../../db/schema";
import { ApolloContext } from "../../app";

export const InstructorCourseResolver = {
    term: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.term.load(instructorCourse.term),
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
                instructorCourse.term,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    total_students: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.totalStudentsByCourse.load(
            [
                instructorCourse.term,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),

    total_credit_hours: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.totalCreditHoursByCourse.load(
            [
                instructorCourse.term,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    credit_hour: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.creditHourByCourse.load(
            [
                instructorCourse.term,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    class_gpa: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.classGpaByCourse.load(
            [
                instructorCourse.term,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    midterm_average: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.midtermAverageByCourse.load(
            [
                instructorCourse.term,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    final_average: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.finalAverageByCourse.load(
            [
                instructorCourse.term,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    midterm_grade_distribution: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.midtermGradeDistributionByCourse.load(
            [
                instructorCourse.term,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
    final_grade_distribution: (instructorCourse: InstructorCourse, _args: any, { loaders }: ApolloContext) =>
        loaders.finalGradeDistributionByCourse.load(
            [
                instructorCourse.term,
                instructorCourse.year,
                instructorCourse.course_subject,
                instructorCourse.course_number,
                instructorCourse.course_suffix,
            ].join('|')
        ),
};