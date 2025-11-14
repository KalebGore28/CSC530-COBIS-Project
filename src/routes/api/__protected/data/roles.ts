import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { roles } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/roles')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const roleResults = await orm.select().from(roles)

                return new Response(JSON.stringify(roleResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})