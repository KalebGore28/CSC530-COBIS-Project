import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { studentPrograms } from '@/db/schema'
import { urlParamsParser } from '@/utils/url-params-parser'
import { createAccessKey, getStudentAccessLevel } from '@/utils/get-student-access-level'

export const Route = createFileRoute('/api/__protected/data/student-programs')({
    server: {
        handlers: {
            GET: async ({ request, context }) => {

                const params = new URL(request.url).searchParams

                const { limit, whereConditions, sort } = urlParamsParser(
                    params,
                    studentPrograms,
                )

                let results = await context.db
                    .select()
                    .from(studentPrograms)
                    .where(whereConditions)
                    .orderBy(...sort)
                    .limit(limit || 1000) // Default limit to 1000 if not specified

                // Apply student access restrictions based on roles
                const studentMnumbers = await getStudentAccessLevel(
                    context.user.mnumber,
                    context.roles,
                    context.faculty.department_code || '',
                )

                const finalResults: typeof results = []
                for (const student of results) {
                    const studentCacheKey = createAccessKey(
                        student.mnumber,
                        student.year,
                        student.term_code,
                    )

                    const accessData = studentMnumbers.terms.get(studentCacheKey)
                    if (!accessData) continue

                    finalResults.push(student)
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
