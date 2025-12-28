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
    },
    studentPrograms: {
        students: r.one.students({
            from: r.studentPrograms.mnumber,
            to: r.students.mnumber,
        }),
    }
}))