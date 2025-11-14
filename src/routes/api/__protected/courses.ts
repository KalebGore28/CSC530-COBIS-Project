import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { courses } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/courses')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const courseResults = await orm.select().from(courses)

                return new Response(JSON.stringify(courseResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})
