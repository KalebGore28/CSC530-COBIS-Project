import { getDbConnection } from "@/db";
import {
    instructorCourses,
    studentCourses,
    studentAdvisors
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getStudentAccess(
    userMnumber: string,
    checks: {
        instructorCheck: boolean;
        advisorCheck: boolean;
    }
): Promise<{ mnumbers: string[] }> {
    const { orm } = await getDbConnection();

    const allStudentMnumbersMap: Record<string, true> = {};

    // Get Student MNumbers for courses taught by the instructor with userMnumber
    if (checks.instructorCheck === true) {
        const studentMnumbers = await orm
            .select({
                student_mnumber: studentCourses.mnumber,
            })
            .from(studentCourses)
            .leftJoin(instructorCourses, eq(studentCourses.course_id, instructorCourses.course_id))
            .where(
                eq(instructorCourses.mnumber, userMnumber)
            );

        studentMnumbers.forEach((s) => {
            allStudentMnumbersMap[s.student_mnumber] = true;
        });
    }

    // Get Student MNumbers for students advised by the advisor with userMnumber
    if (checks.advisorCheck === true) {
        const advisedStudents = await orm
            .select({
                student_mnumber: studentAdvisors.student_mnumber,
            })
            .from(studentAdvisors)
            .where(
                eq(studentAdvisors.advisor_mnumber, userMnumber)
            );

        advisedStudents.forEach((s) => {
            allStudentMnumbersMap[s.student_mnumber] = true;
        });
    }

    const allStudentMnumbers = Object.keys(allStudentMnumbersMap);

    return {
        mnumbers: allStudentMnumbers,
    };
}