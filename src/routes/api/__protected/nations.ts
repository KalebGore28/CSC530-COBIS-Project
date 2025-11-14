import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { nations } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/nations')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const nationResults = await orm.select().from(nations)

                return new Response(JSON.stringify(nationResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})