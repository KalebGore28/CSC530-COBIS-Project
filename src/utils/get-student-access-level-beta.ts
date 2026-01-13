import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import {
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
        data: Map<
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
    mnumbers: Map<
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
    if (!options?.bypassCache) {
        const cached = accessCache.get(cacheKey)
        if (cached && isCacheValid(cached.timestamp)) {
            console.log(`Cache hit for user: ${user_mnumber}`)
            return { mnumbers: cached.data }
        }
    }

    console.log(`Cache miss for user: ${user_mnumber}, fetching from DB...`)

    // Your existing logic here...
    const db = getDb()
    const studentAccessMap = new Map<
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

    // Get Student MNumbers available for Faculty - Course Scoped Level Access
    const studentMnumbers = await db
        .select({
            student_mnumber: studentCourses.mnumber,
            term_code: studentCourses.term_code,
            year: studentCourses.year,
        })
        .from(studentCourses)
        .where(eq(studentCourses.instructor_mnumber, user_mnumber))

    studentMnumbers.forEach((s) => {
        const key = createAccessKey(s.student_mnumber, s.year, s.term_code)

        studentAccessMap.set(key, {
            student_mnumber: s.student_mnumber,
            year: s.year,
            term_code: s.term_code,
            accessLevel: ACCESS_LEVEL.COURSE_SCOPED,
            reason: 'instructor_course_assignment',
            role: ROLES.INSTRUCTOR,
        })
    })

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
        const key = createAccessKey(s.student_mnumber, s.year, s.term_code)

        studentAccessMap.set(key, {
            student_mnumber: s.student_mnumber,
            year: s.year,
            term_code: s.term_code,
            accessLevel: ACCESS_LEVEL.FULL,
            reason: 'advisor_assignment',
            role: ROLES.ADVISOR,
        })
    })

    // Store in cache before returning
    accessCache.set(cacheKey, {
        data: studentAccessMap,
        timestamp: Date.now(),
    })

    return { mnumbers: studentAccessMap }
}

/**
 * Create access key for a student-year-term combination
 */
function createAccessKey(
    student_mnumber: string,
    year: number,
    term_code: string
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
