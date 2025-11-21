import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { students } from '@/db/schema'
import { urlParamsParser } from '@/utils/url-params-parser'
import { getStudentAccess } from '@/utils/get-student-access'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/students')({
    server: {
        handlers: {
            GET: async ({ request, context }) => {
                const user_roles = context.roles

                const { orm } = await getDbConnection()

                const params = new URL(request.url).searchParams

                const { limit, whereConditions, sort } = urlParamsParser(params, students)

                let results = await orm
                    .select()
                    .from(students)
                    .where(whereConditions)
                    .orderBy(...sort)
                    .limit(limit || 1000) // Default limit to 1000 if not specified

                // Apply student access restrictions based on roles
                if (!user_roles.includes('cobis_administrator') && !user_roles.includes('department_chair')) {
                    const studentAccess = await getStudentAccess(context.mnumber || '', {
                        instructorCheck: true,
                        advisorCheck: true,
                    })
                    results = results.filter((student) =>
                        studentAccess.mnumbers.has(student.mnumber)
                    )
                }

                const json = JSON.stringify(results)
                const compressed = gzipSync(Buffer.from(json))

                return new Response(compressed, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Encoding': 'gzip',
                    },
                })
            }
        }
    }
})