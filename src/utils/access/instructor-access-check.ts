import { eq } from 'drizzle-orm'
import type { TermAccessKey, TermEntry } from '@/types/access-checks'
import type { getDb } from '@/db'
import { studentCourses } from '@/db/schema'

import { ACCESS_LEVELS, ROLES } from '@/types/access-checks'
import { createTermAccessKey } from '@/utils/access/utils'

export async function instructorAccessCheck(
    db: ReturnType<typeof getDb>,
    userMnumber: string,
) {
    const accessibleStudents = new Set<string>()
    const termAccessMap = new Map<TermAccessKey, TermEntry>()

    const instructorStudents = await db
        .select({
            student_mnumber: studentCourses.mnumber,
            term_id: studentCourses.term_id,
            year: studentCourses.year,
            instructor_mnumber: studentCourses.instructor_mnumber,
        })
        .from(studentCourses)
        .where(eq(studentCourses.instructor_mnumber, userMnumber))

    instructorStudents.forEach((s) => {
        // Add to overall accessible students
        accessibleStudents.add(s.student_mnumber)

        // Add to term-specific access map
        const key = createTermAccessKey(s.student_mnumber, s.year, s.term_id)
        termAccessMap.set(key, {
            accessLevel: ACCESS_LEVELS.COURSE_SCOPED,
            reason: 'instructor',
            role: ROLES.INSTRUCTOR,
        })
    })

    return {
        accessibleStudents,
        termAccessMap,
    }
}
