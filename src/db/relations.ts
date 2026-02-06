import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, (r) => ({
    students: {
        advisors: r.many.faculty({
            from: r.students.mnumber.through(r.studentAdvisors.mnumber),
            to: r.faculty.mnumber.through(r.studentAdvisors.advisor_mnumber),
        }),
        courses: r.many.courses({
            from: r.students.mnumber.through(r.studentCourses.mnumber),
            to: r.courses.id.through(r.studentCourses.course_id),
        }),
    },
    faculty: {
        advisees: r.many.students({
            from: r.faculty.mnumber.through(r.studentAdvisors.advisor_mnumber),
            to: r.students.mnumber.through(r.studentAdvisors.mnumber),
        }),
    },
    courses: {
        instructors: r.many.faculty({
            from: r.courses.id.through(r.studentCourses.course_id),
            to: r.faculty.mnumber.through(r.studentCourses.instructor_mnumber),
        }),
    },
    // studentPrograms: {
    //     student: r.one.students({
    //         from: r.studentPrograms.mnumber,
    //         to: r.students.mnumber,
    //     }),
    // },
    // studentAcademicInfo: {
    //     student: r.one.students({
    //         from: r.studentAcademicInfo.mnumber,
    //         to: r.students.mnumber,
    //     }),
    // },
    // studentCourses: {
    //     student: r.one.students({
    //         from: r.studentCourses.mnumber,
    //         to: r.students.mnumber,
    //     }),
    //     instructor: r.one.faculty({
    //         from: r.studentCourses.instructor_mnumber,
    //         to: r.faculty.mnumber,
    //     }),
    // },
}))
