import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { admitCodes } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/admit-codes')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const admitCodeResults = await orm.select().from(admitCodes)

                return new Response(JSON.stringify(admitCodeResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})
