import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import {
    courses,
    programs,
    studentAdvisors,
    studentCourses,
    studentPrograms,
} from '@/db/schema'

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
const CACHE_TTL = 0 // temp set to 0 for testing, set to 5 * 60 * 1000 (5 minutes) in production to balance performance and data freshness

type TermEntry = {
    accessLevel: (typeof ACCESS_LEVEL)[keyof typeof ACCESS_LEVEL]
    role: (typeof ROLES)[keyof typeof ROLES]
    reason: string
}

type TermAccessKey = `${string}:${number}-${string}` // "M12345:2024-10"

type CacheEntry = {
    students: Set<string> // Set of student MNumbers the faculty can at least see limited info for.
    terms: Map<TermAccessKey, TermEntry>
    timestamp: number
}

type FacultyMNumber = string

const accessCache = new Map<FacultyMNumber, CacheEntry>()

export function createTermAccessKey(
    mnumber: string,
    year: number,
    term_id: string,
): TermAccessKey {
    return `${mnumber}:${year}-${term_id}`
}

function isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_TTL
}

export async function getStudentTermAccess(
    userMnumber: string,
    userRoles: Set<string>,
    userDepartmentId: string,
    options?: {
        bypassCache: boolean
    },
): Promise<CacheEntry> {
    // Check cache first (unless bypass requested)
    // If cache is invalid, the cache will be replaced below to ensure fresh data and avoid stale reads
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

    const db = getDb()

    // Set of all accessible student mnumbers (for base table queries)
    const accessibleStudents = new Set<string>()

    // Map of term-specific access (for term-scoped table queries)
    const termAccessMap = new Map<TermAccessKey, TermEntry>()

    // Get Student MNumbers available for Admin Assistants - Lowest Level Access
    if (userRoles.has(ROLES.ADMIN_ASSISTANT)) {
        // In order to get the department the student is in, we can look at what programs they are enrolled in.
        // We need to join the studentPrograms table with the programs table to get the department code.
        const studentMnumbers = await db
            .select({
                student_mnumber: studentPrograms.mnumber,
                term_id: studentPrograms.term_id,
                year: studentPrograms.year,
            })
            .from(studentPrograms)
            // INNER JOIN: only include students actively enrolled in valid programs for this department
            .innerJoin(programs, eq(studentPrograms.program_id, programs.id))
            .where(eq(programs.department_id, userDepartmentId))

        studentMnumbers.forEach((s) => {
            // Add to overall accessible students
            accessibleStudents.add(s.student_mnumber)

            // Add to term-specific access map
            const key = createTermAccessKey(
                s.student_mnumber,
                s.year,
                s.term_id,
            )
            termAccessMap.set(key, {
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
            accessLevel: ACCESS_LEVEL.COURSE_SCOPED,
            reason: 'instructor',
            role: ROLES.INSTRUCTOR,
        })
    })

    // Get Student MNumbers available for Department Chairs - Course Scoped/Full Level Access
    if (userRoles.has(ROLES.DEPARTMENT_CHAIR)) {
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
            const key = createTermAccessKey(
                s.student_mnumber,
                s.year,
                s.term_id,
            )
            termAccessMap.set(key, {
                accessLevel: ACCESS_LEVEL.COURSE_SCOPED,
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
            const key = createTermAccessKey(
                s.student_mnumber,
                s.year,
                s.term_id,
            )
            termAccessMap.set(key, {
                accessLevel: ACCESS_LEVEL.FULL,
                reason: 'within_department',
                role: ROLES.DEPARTMENT_CHAIR,
            })
        })
    }

    // Get Student MNumbers available for Program Coordinators - Full Level Access
    if (userRoles.has(ROLES.PROGRAM_COORDINATOR)) {
        const studentMnumbers = await db
            .select({
                student_mnumber: studentPrograms.mnumber,
                term_id: studentPrograms.term_id,
                year: studentPrograms.year,
            })
            .from(studentPrograms)
            // INNER JOIN: only include students actively enrolled in valid programs for which this user is the coordinator
            .innerJoin(programs, eq(studentPrograms.program_id, programs.id))
            .where(eq(programs.coordinator, userMnumber))

        studentMnumbers.forEach((s) => {
            // Add to overall accessible students
            accessibleStudents.add(s.student_mnumber)

            // Add to term-specific access map
            const key = createTermAccessKey(
                s.student_mnumber,
                s.year,
                s.term_id,
            )
            termAccessMap.set(key, {
                accessLevel: ACCESS_LEVEL.FULL,
                reason: 'within_program',
                role: ROLES.PROGRAM_COORDINATOR,
            })
        })
    }

    // Get Student MNumbers available for Advisors - Full Level Access
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
            accessLevel: ACCESS_LEVEL.FULL,
            reason: 'advisor',
            role: ROLES.ADVISOR,
        })
    })

    // Store/replace data in cache
    accessCache.set(userMnumber, {
        students: accessibleStudents,
        terms: termAccessMap,
        timestamp: Date.now(),
    })

    return {
        students: accessibleStudents,
        terms: termAccessMap,
        timestamp: Date.now(),
    }
}

export async function adminAssistantAccessCheck(
    db: ReturnType<typeof getDb>,
    userDepartmentId: string,
) {
    const accessibleStudents = new Set<string>()
    const termAccessMap = new Map<TermAccessKey, TermEntry>()

    const studentMnumbers = await db
        .select({
            student_mnumber: studentPrograms.mnumber,
            term_id: studentPrograms.term_id,
            year: studentPrograms.year,
        })
        .from(studentPrograms)
        // INNER JOIN: only include students actively enrolled in valid programs for this department
        .innerJoin(programs, eq(studentPrograms.program_id, programs.id))
        .where(eq(programs.department_id, userDepartmentId))

    studentMnumbers.forEach((s) => {
        // Add to overall accessible students
        accessibleStudents.add(s.student_mnumber)

        // Add to term-specific access map
        const key = createTermAccessKey(s.student_mnumber, s.year, s.term_id)
        termAccessMap.set(key, {
            accessLevel: ACCESS_LEVEL.LIMITED,
            reason: 'within_department',
            role: ROLES.ADMIN_ASSISTANT,
        })
    })
}
