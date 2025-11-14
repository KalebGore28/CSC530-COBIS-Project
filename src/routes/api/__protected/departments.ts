import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { departments } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/departments')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const departmentResults = await orm.select().from(departments)

                return new Response(JSON.stringify(departmentResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})