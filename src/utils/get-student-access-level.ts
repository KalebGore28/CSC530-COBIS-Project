import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { studentAdvisors, studentCourses, studentPrograms, programs } from '@/db/schema'

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
const ROLE_ACCESS_LEVELS = {
    // FACULTY: 'faculty', // (deprecating role. unnecessary as instructor access is determined by course assignments)
    // ADVISOR: 'advisor', // (deprecating role. unnecessary as advisor access is determined by advisor assignments)
    PROGRAM_COORDINATOR: 'program_coordinator',
    ADMIN_ASSISTANT: 'admin_assistant',
    DEPARTMENT_CHAIR: 'department_chair',
    COBIS_ADMINISTRATOR: 'cobis_administrator',
} as const

const ACCESS_LEVEL = {
    LIMITED: 'limited', // Basic Student Info Only. No grades or GPAs
    COURSE_SCOPED: 'course_scoped', // Access to own course grades
    FULL: 'full', // Full Access to all student data
} as const



export async function getStudentAccessLevel(
    user_mnumber: string,
    user_roles: Set<string>,
    user_department_code: string,
): Promise<{ mnumbers: Map<string, typeof ACCESS_LEVEL[keyof typeof ACCESS_LEVEL]> | undefined }> {

    // Return if no roles to check
    if (
        !user_roles.has(ROLE_ACCESS_LEVELS.PROGRAM_COORDINATOR) &&
        !user_roles.has(ROLE_ACCESS_LEVELS.ADMIN_ASSISTANT) &&
        !user_roles.has(ROLE_ACCESS_LEVELS.DEPARTMENT_CHAIR) &&
        !user_roles.has(ROLE_ACCESS_LEVELS.COBIS_ADMINISTRATOR)
    ) {
        console.warn('No relevant roles found for user in function(getStudentAccessLevel):', user_mnumber)
        return { mnumbers: undefined }
    }

    const db = getDb()

    // A student map of mnumbers with their access levels
    const studentAccessMap = new Map<string, typeof ACCESS_LEVEL[keyof typeof ACCESS_LEVEL]>()

    // We start from lowest access level to highest, so that higher levels can overwrite lower levels.

    // --- Limited Access Level ---
    // Get Student MNumbers available for Admin Assistants - Lowest Level Access
    if (user_roles.has(ROLE_ACCESS_LEVELS.ADMIN_ASSISTANT)) {
        // In order to get the department the student is in, we can look at what programs they are enrolled in.
        // We need to join the studentPrograms table with the programs table to get the department code.
        const studentMnumbers = await db
            .select({
                student_mnumber: studentPrograms.mnumber,
            })
            .from(studentPrograms)
            // INNER JOIN: only include students actively enrolled in valid programs for this department
            .innerJoin(
                programs,
                eq(studentPrograms.program_code, programs.code),
            )
            .where(eq(programs.department_code, user_department_code))

        studentMnumbers.forEach((s) => {
            studentAccessMap.set(s.student_mnumber, ACCESS_LEVEL.LIMITED)
        })
    }

    // --- Course Scoped Access Level ---
    // Get Student MNumbers available for Faculty - Course Scoped Level Access
    // No role check needed as this is determined by course assignments
    const studentMnumbers = await db
        .select({
            student_mnumber: studentCourses.mnumber,
        })
        .from(studentCourses)
        .where(eq(studentCourses.instructor_mnumber, user_mnumber))

    studentMnumbers.forEach((s) =>
        studentAccessMap.set(s.student_mnumber, ACCESS_LEVEL.COURSE_SCOPED),
    )

    // --- Full Access Level ---
    // Get Student MNumbers available for Program Coordinators - Full Level Access
    if (user_roles.has(ROLE_ACCESS_LEVELS.PROGRAM_COORDINATOR)) {
        // Right now we don't have a way to link Program Coordinators to specific programs.
        // We need more info on whether Program Coordinators can be over multiple programs or just one.
        // We can't implement this until we have that info.
        console.warn('Program Coordinator access level not implemented yet in function(getStudentAccessLevel):', user_mnumber)
    }

    // Get Student MNumbers available for Department Chairs - Full Level Access
    if (user_roles.has(ROLE_ACCESS_LEVELS.DEPARTMENT_CHAIR)) {
        // In order to get the department the student is in, we can look at what programs they are enrolled in.
        // We need to join the studentPrograms table with the programs table to get the department code.
        const studentMnumbers = await db
            .select({
                student_mnumber: studentPrograms.mnumber,
            })
            .from(studentPrograms)
            .innerJoin(
                programs,
                eq(studentPrograms.program_code, programs.code),
            )
            .where(eq(programs.department_code, user_department_code))

        studentMnumbers.forEach((s) => {
            studentAccessMap.set(s.student_mnumber, ACCESS_LEVEL.FULL)
        })
    }

    // Get Student MNumbers available for Advisors - Full Level Access
    // No role check needed as this is determined by advisor assignments
    const advisedStudents = await db
        .select({
            student_mnumber: studentAdvisors.student_mnumber,
        })
        .from(studentAdvisors)
        .where(eq(studentAdvisors.advisor_mnumber, user_mnumber))

    advisedStudents.forEach((s) =>
        studentAccessMap.set(s.student_mnumber, ACCESS_LEVEL.FULL),
    )

    return {
        mnumbers: studentAccessMap,
    }
}