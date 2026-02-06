import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { inArray } from 'drizzle-orm'
import { studentCourses } from '@/db/schema'
import {
    createAccessKey,
    getStudentAccessLevel,
} from '@/utils/get-student-access-level'

export const Route = createFileRoute('/api/__protected/data/student-courses')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                // Get student access restrictions based on roles
                const studentMnumbers = await getStudentAccessLevel(
                    context.user.mnumber,
                    context.roles,
                    context.faculty.department_id || '',
                )

                const results = await context.db
                    .select()
                    .from(studentCourses)
                    // Immediately filter out students with no access
                    .where(
                        inArray(
                            studentCourses.mnumber,
                            Array.from(studentMnumbers.students),
                        ),
                    )

                const finalResults: typeof results = []
                for (const student of results) {
                    const studentCacheKey = createAccessKey(
                        student.mnumber,
                        student.year,
                        student.term_id,
                    )

                    const accessData =
                        studentMnumbers.terms.get(studentCacheKey)
                    if (!accessData) continue

                    if (accessData.accessLevel === 'limited') {
                        // Users with limited level cannot view grades
                        finalResults.push({
                            ...student,
                            midterm_grade: null,
                            final_grade: null,
                            // Diagnostic Info:
                            // accesslevel: accessData.accessLevel,
                            // role: accessData.role,
                            // reason: accessData.reason,
                        })
                    } else if (accessData.accessLevel === 'course_scoped') {
                        // Users with course_scoped level can only view if they are the instructor
                        if (
                            student.instructor_mnumber === context.user.mnumber
                        ) {
                            finalResults.push({
                                ...student,
                                // Diagnostic Info:
                                // accesslevel: accessData.accessLevel,
                                // role: accessData.role,
                                // reason: accessData.reason,
                            })
                        }
                    } else {
                        finalResults.push({
                            ...student,
                            // Diagnostic Info:
                            // accesslevel: accessData.accessLevel,
                            // role: accessData.role,
                            // reason: accessData.reason,
                        })
                    }
                }

                const json = JSON.stringify(finalResults)
                const compressed = gzipSync(Buffer.from(json))

                return new Response(compressed, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Encoding': 'gzip',
                    },
                })
            },
        },
    },
})
