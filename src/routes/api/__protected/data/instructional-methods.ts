import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { instructionalMethods } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/instructional-methods')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const instructionalMethodResults = await orm.select().from(instructionalMethods)

                return new Response(JSON.stringify(instructionalMethodResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})