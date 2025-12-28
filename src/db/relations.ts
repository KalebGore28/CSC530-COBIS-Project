import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations({ ...schema }, (r) => ({
    account: {
        user: r.one.user({
            from: r.account.userId,
            to: r.user.id,
        }),
    },
    session: {
        user: r.one.user({
            from: r.session.userId,
            to: r.user.id,
        }),
    },
    departments: {
        college: r.one.colleges({
            from: r.departments.college_code,
            to: r.colleges.code,
        }),
    },
    students: {
        programs: r.many.studentPrograms({
            from: r.students.mnumber,
            to: r.studentPrograms.mnumber,
        }),
        academicInfo: r.many.studentAcademicInfo({
            from: r.students.mnumber,
            to: r.studentAcademicInfo.mnumber,
        }),
        advisors: r.many.studentAdvisors({
            from: r.students.mnumber,
            to: r.studentAdvisors.student_mnumber,
        }),
        courses: r.many.studentCourses({
            from: r.students.mnumber,
            to: r.studentCourses.mnumber,
        }),
    },
    studentPrograms: {
        students: r.one.students({
            from: r.studentPrograms.mnumber,
            to: r.students.mnumber,
        }),
    },
    studentAcademicInfo: {
        students: r.one.students({
            from: r.studentAcademicInfo.mnumber,
            to: r.students.mnumber,
        }),
    },
    studentAdvisors: {
        students: r.one.students({
            from: r.studentAdvisors.student_mnumber,
            to: r.students.mnumber,
        }),
        faculty: r.one.faculty({
            from: r.studentAdvisors.advisor_mnumber,
            to: r.faculty.mnumber,
        }),
    },
    studentCourses: {
        students: r.one.students({
            from: r.studentCourses.mnumber,
            to: r.students.mnumber,
        }),
        instructor: r.one.faculty({
            from: r.studentCourses.instructor_mnumber,
            to: r.faculty.mnumber,
        }),
    }
}))