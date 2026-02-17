import { adminAssistantAccessCheck } from './access-checks/admin-assistant'
import { advisorAccessCheck } from './access-checks/advisor'
import { departmentChairAccessCheck } from './access-checks/department-chair'
import { instructorAccessCheck } from './access-checks/instructor-access'
import { programCoordinatorAccessCheck } from './access-checks/program-coordinator'
import { createTermAccessKey } from './access-checks/utils'
import type {
    CacheEntry,
    FacultyMNumber,
    TermAccessKey,
    TermEntry,
} from '@/types/access-checks'
import type { studentCourses } from '@/db/schema'
import type { getDb } from '@/db'
import { ROLES } from '@/types/access-checks'

type StudentCourse = typeof studentCourses.$inferSelect
type ExtendedCourse = StudentCourse & {
    department_id: string | null
}

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

export function filterStudentCoursesByAccess(
    userMnumber: string,
    userDepartmentId: string,
    studentCourses: Array<ExtendedCourse>,
    accessibleStudents: Set<string>,
    termAccessMap: Map<TermAccessKey, TermEntry>,
) {
    const filteredCourses: Array<StudentCourse> = []

    for (const course of studentCourses) {
        // If the student's mnumber is not in the accessible students set, filter out this course
        if (!accessibleStudents.has(course.mnumber)) continue

        const key = createTermAccessKey(
            course.mnumber,
            course.year,
            course.term_id,
        )
        const accessEntry = termAccessMap.get(key)

        // Deny access if there is not an access entry for this student-year-term combination
        if (!accessEntry) continue

        // If department_id is null for some reason with a course, we deny as we can't verify access
        if (course.department_id === null) continue

        if (accessEntry.role === ROLES.ADVISOR) {
            // Advisors have access to all courses for their advisees, so we can include the course without further checks
            filteredCourses.push(course)
        } else if (accessEntry.role === ROLES.PROGRAM_COORDINATOR) {
            // Program Coordinators have access to all courses for students in their programs, so we can include the course without further checks
            filteredCourses.push(course)
        } else if (accessEntry.role === ROLES.INSTRUCTOR) {
            // Instructors only have access to courses they teach, so we need to check if the course's instructor matches the user's mnumber
            if (course.instructor_mnumber !== userMnumber) continue
            filteredCourses.push(course)
        } else if (accessEntry.role === ROLES.DEPARTMENT_CHAIR) {
            // Department Chairs have access to courses in their department, so we need to check if the course's department matches the user's department
            if (course.department_id !== userDepartmentId) continue
            filteredCourses.push(course)
        } else if (accessEntry.role === ROLES.ADMIN_ASSISTANT) {
            // Admin Assistants have access to courses in their department but with limited access, so we need to check if the course's department matches the user's department
            if (course.department_id !== userDepartmentId) continue

            // We need to remove the grade data for courses as Admin Assistants don't have access to grades.
            filteredCourses.push({
                ...course,
                midterm_grade: null,
                final_grade: null,
            })
        } else {
            // No other role needs to have access
            continue
        }
    }

    return filteredCourses
}
