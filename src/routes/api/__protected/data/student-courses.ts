import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { studentCourses } from '@/db/schema'
import { urlParamsParser } from '@/utils/url-params-parser'
import {
    createAccessKey,
    getStudentAccessLevel,
} from '@/utils/get-student-access-level'

export const Route = createFileRoute('/api/__protected/data/student-courses')({
    server: {
        handlers: {
            GET: async ({ request, context }) => {

                const params = new URL(request.url).searchParams

                const { limit, whereConditions, sort } = urlParamsParser(
                    params,
                    studentCourses,
                )

                let results = await context.db
                    .select()
                    .from(studentCourses)
                    .where(whereConditions)
                    .orderBy(...sort)
                    .limit(limit || 1000) // Default limit to 1000 if not specified

                // Apply student access restrictions based on roles
                const studentMnumbers = await getStudentAccessLevel(
                    context.user.mnumber,
                    context.roles,
                    context.faculty.department_code || '',
                )

                results = results
                    .map((student) => {
                        const studentCacheKey = createAccessKey(
                            student.mnumber,
                            student.year,
                            student.term_code,
                        )

                        const accessData =
                            studentMnumbers.terms.get(studentCacheKey)

                        if (accessData === undefined) {
                            return null
                        }

                        if (accessData?.accessLevel === 'limited') {
                            console.log(
                                'Stripping Data from Student Course:',
                                student.mnumber,
                            )
                            return {
                                ...student,
                                midterm_grade: null,
                                final_grade: null,
                            }
                        }

                        return student
                    })
                    .filter(
                        (student): student is NonNullable<typeof student> =>
                            student !== null,
                    )

                const json = JSON.stringify(results)
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
