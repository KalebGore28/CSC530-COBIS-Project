import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import {
    courses,
    programs,
    studentAdvisors,
    studentCourses,
    studentPrograms,
} from '@/db/schema'

// Define the term key type
type AccessKey = `${string}:${number}-${string}` // "M12345:2024-10"

/**
 * Roles that this function checks for:
 * - Faculty: Access to students enrolled in their courses
 * - Advisor: Access to students they advise
 * - Program Coordinator: Access to students in their programs
 * - Admin Assistant: Access to students in their department.
 * - Department Chair: Access to students in their department's programs
 * - COBIS Administrator: Technically has access to all student data on backend database if they maintain it, but front-end will restrict access unless one of the other roles are present.
 */

// Define access levels
const ROLES = {
    INSTRUCTOR: 'instructor', // This role is not required to be passed in user_roles, as it's determined by course assignments
    ADVISOR: 'advisor', // This role is not required to be passed in user_roles, as it's determined by advisor assignments
    PROGRAM_COORDINATOR: 'program_coordinator',
    ADMIN_ASSISTANT: 'admin_assistant',
    DEPARTMENT_CHAIR: 'department_chair',
    COBIS_ADMINISTRATOR: 'cobis_administrator',
} as const

const ACCESS_LEVEL = {
    LIMITED: 'limited', // Basic Student Info Only. No grades or GPAs
    COURSE_SCOPED: 'course_scoped', // Access to specific student course grades, no GPA access
    FULL: 'full', // Full Access to all student data
} as const

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds
const accessCache = new Map<
    string,
    {
        students: Set<string> // For base student table - just mnumbers
        terms: Map<
            // For term-specific access
            AccessKey,
            {
                student_mnumber: string
                year: number
                term_code: string
                accessLevel: (typeof ACCESS_LEVEL)[keyof typeof ACCESS_LEVEL]
                role: (typeof ROLES)[keyof typeof ROLES]
                reason: string
            }
        >
        timestamp: number
    }
>()

export async function getStudentAccessLevel(
    user_mnumber: string,
    user_roles: Set<string>,
    user_department_code: string,
    options?: {
        current_term?: string
        bypassCache?: boolean
    },
): Promise<{
    students: Set<string> // For base student table - just mnumbers
    terms: Map<
        AccessKey,
        {
            student_mnumber: string
            year: number
            term_code: string
            accessLevel: (typeof ACCESS_LEVEL)[keyof typeof ACCESS_LEVEL]
            role: (typeof ROLES)[keyof typeof ROLES]
            reason: string
        }
    >
}> {
    const cacheKey = getCacheKey(
        user_mnumber,
        user_roles,
        user_department_code,
        options?.current_term,
    )

    // Check cache first (unless bypass requested)
    // If cache is invalid, the cache will be replaced below to ensure fresh data and avoid stale reads
    if (!options?.bypassCache) {
        const cached = accessCache.get(cacheKey)
        if (cached && isCacheValid(cached.timestamp)) {
            console.log(`Cache hit for faculty user: ${user_mnumber}`)
            return {
                students: cached.students,
                terms: cached.terms,
            }
        }
    }

    console.log(
        `Cache miss for faculty user: ${user_mnumber}, fetching from DB...`,
    )

    const db = getDb()

    // Set of all accessible student mnumbers (for base table queries)
    const accessibleStudents = new Set<string>()

    // Map of term-specific access (for term-scoped table queries)
    const termAccessMap = new Map<
        AccessKey,
        {
            student_mnumber: string
            year: number
            term_code: string
            accessLevel: (typeof ACCESS_LEVEL)[keyof typeof ACCESS_LEVEL]
            role: (typeof ROLES)[keyof typeof ROLES]
            reason: string
        }
    >()

    // Get Student MNumbers available for Admin Assistants - Lowest Level Access
    if (user_roles.has(ROLES.ADMIN_ASSISTANT)) {
        // In order to get the department the student is in, we can look at what programs they are enrolled in.
        // We need to join the studentPrograms table with the programs table to get the department code.
        const studentMnumbers = await db
            .select({
                student_mnumber: studentPrograms.mnumber,
                term_code: studentPrograms.term_code,
                year: studentPrograms.year,
            })
            .from(studentPrograms)
            // INNER JOIN: only include students actively enrolled in valid programs for this department
            .innerJoin(
                programs,
                eq(studentPrograms.program_code, programs.code),
            )
            .where(eq(programs.department_code, user_department_code))

        studentMnumbers.forEach((s) => {
            // Add to overall accessible students
            accessibleStudents.add(s.student_mnumber)

            // Add to term-specific access map
            const key = createAccessKey(s.student_mnumber, s.year, s.term_code)
            termAccessMap.set(key, {
                student_mnumber: s.student_mnumber,
                year: s.year,
                term_code: s.term_code,
                accessLevel: ACCESS_LEVEL.LIMITED,
                reason: 'within_department',
                role: ROLES.ADMIN_ASSISTANT,
            })
        })
    }

    // Get Student MNumbers available for Faculty - Course Scoped Level Access
    const instructorStudents = await db
        .select({
            student_mnumber: studentCourses.mnumber,
            term_code: studentCourses.term_code,
            year: studentCourses.year,
        })
        .from(studentCourses)
        .where(eq(studentCourses.instructor_mnumber, user_mnumber))

    instructorStudents.forEach((s) => {
        // Add to overall accessible students
        accessibleStudents.add(s.student_mnumber)

        // Add to term-specific access map
        const key = createAccessKey(s.student_mnumber, s.year, s.term_code)
        termAccessMap.set(key, {
            student_mnumber: s.student_mnumber,
            year: s.year,
            term_code: s.term_code,
            accessLevel: ACCESS_LEVEL.COURSE_SCOPED,
            reason: 'instructor',
            role: ROLES.INSTRUCTOR,
        })
    })

    // Get Student MNumbers available for Department Chairs - Course Scoped/Full Level Access
    if (user_roles.has(ROLES.DEPARTMENT_CHAIR)) {
        // Course Scoped Access
        const courseStudents = await db
            .select({
                student_mnumber: studentCourses.mnumber,
                term_code: studentCourses.term_code,
                year: studentCourses.year,
            })
            .from(studentCourses)
            .innerJoin(courses, eq(studentCourses.course_id, courses.code))
            .where(eq(courses.department_code, user_department_code))

        courseStudents.forEach((s) => {
            // Add to overall accessible students
            accessibleStudents.add(s.student_mnumber)

            // Add to term-specific access map
            const key = createAccessKey(s.student_mnumber, s.year, s.term_code)
            termAccessMap.set(key, {
                student_mnumber: s.student_mnumber,
                year: s.year,
                term_code: s.term_code,
                accessLevel: ACCESS_LEVEL.COURSE_SCOPED,
                reason: 'student_course_in_department',
                role: ROLES.DEPARTMENT_CHAIR,
            })
        })

        // Full Level Access
        const studentMnumbersFull = await db
            .select({
                student_mnumber: studentPrograms.mnumber,
                term_code: studentPrograms.term_code,
                year: studentPrograms.year,
            })
            .from(studentPrograms)
            .innerJoin(
                programs,
                eq(studentPrograms.program_code, programs.code),
            )
            .where(eq(programs.department_code, user_department_code))

        studentMnumbersFull.forEach((s) => {
            // Add to overall accessible students
            accessibleStudents.add(s.student_mnumber)

            // Add to term-specific access map
            const key = createAccessKey(s.student_mnumber, s.year, s.term_code)
            termAccessMap.set(key, {
                student_mnumber: s.student_mnumber,
                year: s.year,
                term_code: s.term_code,
                accessLevel: ACCESS_LEVEL.FULL,
                reason: 'within_department',
                role: ROLES.DEPARTMENT_CHAIR,
            })
        })
    }

    // Get Student MNumbers available for Program Coordinators - Full Level Access
    if (user_roles.has(ROLES.PROGRAM_COORDINATOR)) {
        const studentMnumbers = await db
            .select({
                student_mnumber: studentPrograms.mnumber,
                term_code: studentPrograms.term_code,
                year: studentPrograms.year,
            })
            .from(studentPrograms)
            // INNER JOIN: only include students actively enrolled in valid programs for which this user is the coordinator
            .innerJoin(
                programs,
                eq(studentPrograms.program_code, programs.code),
            )
            .where(eq(programs.coordinator, user_mnumber))

        studentMnumbers.forEach((s) => {
            // Add to overall accessible students
            accessibleStudents.add(s.student_mnumber)

            // Add to term-specific access map
            const key = createAccessKey(s.student_mnumber, s.year, s.term_code)
            termAccessMap.set(key, {
                student_mnumber: s.student_mnumber,
                year: s.year,
                term_code: s.term_code,
                accessLevel: ACCESS_LEVEL.FULL,
                reason: 'within_department',
                role: ROLES.PROGRAM_COORDINATOR,
            })
        })
    }

    // Get Student MNumbers available for Advisors - Full Level Access
    const advisedStudents = await db
        .select({
            student_mnumber: studentAdvisors.student_mnumber,
            term_code: studentAdvisors.term_code,
            year: studentAdvisors.year,
        })
        .from(studentAdvisors)
        .where(eq(studentAdvisors.advisor_mnumber, user_mnumber))

    advisedStudents.forEach((s) => {
        // Add to overall accessible students
        accessibleStudents.add(s.student_mnumber)

        // Add to term-specific access map
        const key = createAccessKey(s.student_mnumber, s.year, s.term_code)
        termAccessMap.set(key, {
            student_mnumber: s.student_mnumber,
            year: s.year,
            term_code: s.term_code,
            accessLevel: ACCESS_LEVEL.FULL,
            reason: 'advisor',
            role: ROLES.ADVISOR,
        })
    })

    console.log(termAccessMap)

    // Store/replace data in cache
    accessCache.set(cacheKey, {
        students: accessibleStudents,
        terms: termAccessMap,
        timestamp: Date.now(),
    })

    return { students: accessibleStudents, terms: termAccessMap }
}

/**
 * Create access key for a student-year-term combination
 * @param student_mnumber
 * @param year
 * @param term_code
 * @returns string in format "M12345:2024-10"
 */
export function createAccessKey(
    student_mnumber: string,
    year: number,
    term_code: string,
): AccessKey {
    return `${student_mnumber}:${year}-${term_code}`
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_TTL
}

/**
 * Generate cache key based on user context and current term
 */
function getCacheKey(
    user_mnumber: string,
    user_roles: Set<string>,
    user_department_code: string,
    current_term?: string,
): string {
    const rolesArray = Array.from(user_roles).sort()
    return `${user_mnumber}:${rolesArray.join(',')}:${user_department_code}:${current_term || 'all'}`
}

/**
 * Manually invalidate cache for a specific user or all users
 * @param user_mnumber MNumber of the user whose cache should be invalidated. If not provided, the entire cache is cleared.
 */
export function invalidateAccessCache(user_mnumber?: string) {
    if (user_mnumber) {
        // Invalidate all cache entries for this user
        for (const [key] of accessCache) {
            if (key.startsWith(`${user_mnumber}:`)) {
                accessCache.delete(key)
            }
        }
    } else {
        // Clear entire cache
        accessCache.clear()
    }
}
