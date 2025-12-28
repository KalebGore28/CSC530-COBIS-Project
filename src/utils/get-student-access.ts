import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { studentAdvisors, studentCourses } from '@/db/schema'

export async function getStudentAccess(
    userMnumber: string,
    checks: {
        instructorCheck: boolean
        advisorCheck: boolean
    },
): Promise<{ mnumbers: Set<string> }> {
    const db = getDb()

    const allStudentMnumbers = new Set<string>()

    // Get Student MNumbers for courses taught by the instructor with userMnumber
    if (checks.instructorCheck === true) {
        const studentMnumbers = await db
            .select({
                student_mnumber: studentCourses.mnumber,
            })
            .from(studentCourses)
            .where(eq(studentCourses.instructor_mnumber, userMnumber))

        studentMnumbers.forEach((s) =>
            allStudentMnumbers.add(s.student_mnumber),
        )
    }

    // Get Student MNumbers for students advised by the advisor with userMnumber
    if (checks.advisorCheck === true) {
        const advisedStudents = await db
            .select({
                student_mnumber: studentAdvisors.student_mnumber,
            })
            .from(studentAdvisors)
            .where(eq(studentAdvisors.advisor_mnumber, userMnumber))

        advisedStudents.forEach((s) =>
            allStudentMnumbers.add(s.student_mnumber),
        )
    }

    return {
        mnumbers: allStudentMnumbers,
    }
}
