import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { studentAdvisors } from '@/db/schema'
import { urlParamsParser } from '@/utils/url-params-parser'

export const Route = createFileRoute('/api/__protected/data/student-advisors')({
    server: {
        handlers: {
            GET: async ({ request, context }) => {
                const user_roles = context.roles

                const params = new URL(request.url).searchParams

                const { limit, whereConditions, sort } = urlParamsParser(
                    params,
                    studentAdvisors,
                )

                let results = await context.db
                    .select()
                    .from(studentAdvisors)
                    .where(whereConditions)
                    .orderBy(...sort)
                    .limit(limit || 1000) // Default limit to 1000 if not specified

                // If not cobis_administrator or department_chair, filter to only the advisors' own students
                if (
                    !user_roles.includes('cobis_administrator') &&
                    !user_roles.includes('department_chair')
                ) {
                    results = results.filter(
                        (sa) => sa.advisor_mnumber === context.user.mnumber,
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
            },
        },
    },
})
