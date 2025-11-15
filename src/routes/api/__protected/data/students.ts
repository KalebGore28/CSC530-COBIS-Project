import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { students } from '@/db/schema'
import { urlParamsParser } from '@/utils/url-params-parser'

export const Route = createFileRoute('/api/__protected/data/students')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const { orm } = await getDbConnection()

                const params = new URL(request.url).searchParams

                const { limit, whereConditions, sort } = urlParamsParser(params, students)

                let results = await orm
                    .select()
                    .from(students)
                    .where(whereConditions)
                    .orderBy(...sort)
                    .limit(limit || 1000) // Default limit to 1000 if not specified

                return new Response(JSON.stringify(results), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            }
        }
    }
})