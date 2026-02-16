import { eq } from 'drizzle-orm'
import type { TermAccessKey, TermEntry } from '@/types/access-checks'
import type { getDb } from '@/db'
import { courses, programs, studentCourses, studentPrograms } from '@/db/schema'

import { ACCESS_LEVELS, ROLES } from '@/types/access-checks'
import { createTermAccessKey } from '@/utils/access/utils'

export async function departmentChairAccessCheck(
    db: ReturnType<typeof getDb>,
    userDepartmentId: string,
) {
    const accessibleStudents = new Set<string>()
    const termAccessMap = new Map<TermAccessKey, TermEntry>()

    // Course Scoped Access
    const courseStudents = await db
        .select({
            student_mnumber: studentCourses.mnumber,
            term_id: studentCourses.term_id,
            year: studentCourses.year,
        })
        .from(studentCourses)
        .innerJoin(courses, eq(studentCourses.course_id, courses.id))
        .where(eq(courses.department_id, userDepartmentId))

    courseStudents.forEach((s) => {
        // Add to overall accessible students
        accessibleStudents.add(s.student_mnumber)

        // Add to term-specific access map
        const key = createTermAccessKey(s.student_mnumber, s.year, s.term_id)
        termAccessMap.set(key, {
            accessLevel: ACCESS_LEVELS.COURSE_SCOPED,
            reason: 'student_course_in_department',
            role: ROLES.DEPARTMENT_CHAIR,
        })
    })

    // Full Level Access
    const studentMnumbersFull = await db
        .select({
            student_mnumber: studentPrograms.mnumber,
            term_id: studentPrograms.term_id,
            year: studentPrograms.year,
        })
        .from(studentPrograms)
        .innerJoin(programs, eq(studentPrograms.program_id, programs.id))
        .where(eq(programs.department_id, userDepartmentId))

    studentMnumbersFull.forEach((s) => {
        // Add to overall accessible students
        accessibleStudents.add(s.student_mnumber)

        // Add to term-specific access map
        const key = createTermAccessKey(s.student_mnumber, s.year, s.term_id)
        termAccessMap.set(key, {
            accessLevel: ACCESS_LEVELS.FULL,
            reason: 'within_department',
            role: ROLES.DEPARTMENT_CHAIR,
        })
    })

    return {
        accessibleStudents,
        termAccessMap,
    }
}
