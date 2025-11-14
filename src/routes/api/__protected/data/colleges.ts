import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { colleges } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/colleges')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const collegeResults = await orm.select().from(colleges)

                return new Response(JSON.stringify(collegeResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})