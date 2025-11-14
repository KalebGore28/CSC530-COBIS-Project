import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { terms } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/terms')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const termResults = await orm.select().from(terms)

                return new Response(JSON.stringify(termResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})