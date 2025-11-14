import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { students } from '@/db/schema'

import { urlParamsWhereParser } from '@/utils/url-params-where-parser'

export const Route = createFileRoute('/api/__protected/data/students')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const { orm } = await getDbConnection()

                const url = new URL(request.url)
                const params = url.searchParams
                console.log(params)

                const whereConditions = urlParamsWhereParser(params, students)

                const results = whereConditions
                    ? await orm.select().from(students).where(whereConditions)
                    : await orm.select().from(students)

                return new Response(JSON.stringify(results), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})