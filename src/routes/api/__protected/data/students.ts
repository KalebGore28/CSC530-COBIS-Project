import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { students } from '@/db/schema'
import { urlParamsParser } from '@/utils/url-params-parser'
import { getStudentAccessLevel } from '@/utils/get-student-access-level'

export const Route = createFileRoute('/api/__protected/data/students')({
    server: {
        handlers: {
            GET: async ({ request, context }) => {
                const params = new URL(request.url).searchParams

                const { limit, whereConditions, sort } = urlParamsParser(
                    params,
                    students,
                )

                let results = await context.db
                    .select()
                    .from(students)
                    .where(whereConditions)
                    .orderBy(...sort)
                    .limit(limit || 1000) // Default limit to 1000 if not specified

                // Apply student access restrictions based on roles
                const studentMnumbers = await getStudentAccessLevel(
                    context.user.mnumber,
                    context.roles,
                    context.faculty.department_code || '',
                )

                results = results.filter((student) =>
                    studentMnumbers.students.has(student.mnumber),
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
