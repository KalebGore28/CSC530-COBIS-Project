import { eq } from 'drizzle-orm'
import type { TermAccessKey, TermEntry } from '@/types/access-checks'
import type { getDb } from '@/db'
import { studentAdvisors } from '@/db/schema'

import { ACCESS_LEVELS, ROLES } from '@/types/access-checks'
import { createTermAccessKey } from '@/utils/access/utils'

export async function advisorAccessCheck(
    db: ReturnType<typeof getDb>,
    userMnumber: string,
) {
    const accessibleStudents = new Set<string>()
    const termAccessMap = new Map<TermAccessKey, TermEntry>()

    const advisedStudents = await db
        .select({
            student_mnumber: studentAdvisors.mnumber,
            term_id: studentAdvisors.term_id,
            year: studentAdvisors.year,
        })
        .from(studentAdvisors)
        .where(eq(studentAdvisors.advisor_mnumber, userMnumber))

    advisedStudents.forEach((s) => {
        // Add to overall accessible students
        accessibleStudents.add(s.student_mnumber)

        // Add to term-specific access map
        const key = createTermAccessKey(s.student_mnumber, s.year, s.term_id)
        termAccessMap.set(key, {
            accessLevel: ACCESS_LEVELS.FULL,
            reason: 'advisor',
            role: ROLES.ADVISOR,
        })
    })

    return {
        accessibleStudents,
        termAccessMap,
    }
}
