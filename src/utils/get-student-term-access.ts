import { adminAssistantAccessCheck } from './access-checks/admin-assistant'
import { advisorAccessCheck } from './access-checks/advisor'
import { departmentChairAccessCheck } from './access-checks/department-chair'
import { instructorAccessCheck } from './access-checks/instructor-access'
import { programCoordinatorAccessCheck } from './access-checks/program-coordinator'

import type {
    CacheEntry,
    FacultyMNumber,
    TermAccessKey,
    TermEntry,
} from '@/types/access-checks'
import type { getDb } from '@/db'
import { ROLES } from '@/types/access-checks'

// Cache configuration
const CACHE_TTL = 0 // temp set to 0 for testing, set to 5 * 60 * 1000 (5 minutes) in production to balance performance and data freshness

const accessCache = new Map<FacultyMNumber, CacheEntry>()

function isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_TTL
}

export async function getStudentTermAccess(
    db: ReturnType<typeof getDb>,
    userMnumber: string,
    userRoles: Set<string>,
    userDepartmentId: string,
    options?: {
        bypassCache: boolean
    },
): Promise<CacheEntry> {
    // Check cache first (unless bypass requested)
    if (!options?.bypassCache) {
        const cached = accessCache.get(userMnumber)
        if (cached && isCacheValid(cached.timestamp)) {
            console.log(`Cache hit for faculty user: ${userMnumber}`)
            return {
                students: cached.students,
                terms: cached.terms,
                timestamp: cached.timestamp,
            }
        }
    }

    console.log(
        `Cache miss for faculty user: ${userMnumber}, fetching from DB...`,
    )

    // Set of all accessible student mnumbers (for base table queries)
    const finalAccessibleStudents = new Set<string>()

    // Map of term-specific access (for term-scoped table queries)
    const finalTermAccessMap = new Map<TermAccessKey, TermEntry>()

    // Get Student MNumbers available for Admin Assistants - Lowest Level Access
    if (userRoles.has(ROLES.ADMIN_ASSISTANT)) {
        // In order to get the department the student is in, we can look at what programs they are enrolled in.
        // We need to join the studentPrograms table with the programs table to get the department code.
        const { accessibleStudents, termAccessMap } =
            await adminAssistantAccessCheck(db, userDepartmentId)

        // Merge results into overall access maps
        accessibleStudents.forEach((mnumber) =>
            finalAccessibleStudents.add(mnumber),
        )
        termAccessMap.forEach((entry, key) =>
            finalTermAccessMap.set(key, entry),
        )
    }

    // Get Student MNumbers available for Faculty - Course Scoped Level Access
    const {
        accessibleStudents: instructorStudents,
        termAccessMap: instructorTermMap,
    } = await instructorAccessCheck(db, userMnumber)

    // Merge results into overall access maps
    instructorStudents.forEach((mnumber) =>
        finalAccessibleStudents.add(mnumber),
    )
    instructorTermMap.forEach((entry, key) =>
        finalTermAccessMap.set(key, entry),
    )

    // Get Student MNumbers available for Department Chairs - Course Scoped/Full Level Access
    if (userRoles.has(ROLES.DEPARTMENT_CHAIR)) {
        const { accessibleStudents, termAccessMap } =
            await departmentChairAccessCheck(db, userDepartmentId)

        // Merge results into overall access maps
        accessibleStudents.forEach((mnumber) =>
            finalAccessibleStudents.add(mnumber),
        )
        termAccessMap.forEach((entry, key) =>
            finalTermAccessMap.set(key, entry),
        )
    }

    // Get Student MNumbers available for Program Coordinators - Full Level Access
    if (userRoles.has(ROLES.PROGRAM_COORDINATOR)) {
        const { accessibleStudents, termAccessMap } =
            await programCoordinatorAccessCheck(db, userMnumber)

        // Merge results into overall access maps
        accessibleStudents.forEach((mnumber) =>
            finalAccessibleStudents.add(mnumber),
        )
        termAccessMap.forEach((entry, key) =>
            finalTermAccessMap.set(key, entry),
        )
    }

    // Get Student MNumbers available for Advisors - Full Level Access
    const {
        accessibleStudents: advisorStudents,
        termAccessMap: advisorTermMap,
    } = await advisorAccessCheck(db, userMnumber)

    // Merge results into overall access maps
    advisorStudents.forEach((mnumber) => finalAccessibleStudents.add(mnumber))
    advisorTermMap.forEach((entry, key) => finalTermAccessMap.set(key, entry))

    // Store/replace data in cache
    accessCache.set(userMnumber, {
        students: finalAccessibleStudents,
        terms: finalTermAccessMap,
        timestamp: Date.now(),
    })

    return {
        students: finalAccessibleStudents,
        terms: finalTermAccessMap,
        timestamp: Date.now(),
    }
}
