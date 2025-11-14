import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { registrationStatus } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/registration-status')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const statusResults = await orm.select().from(registrationStatus)

                return new Response(JSON.stringify(statusResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})