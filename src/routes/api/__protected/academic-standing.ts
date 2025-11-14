import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { academicStanding } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/academic-standing')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()
                
                const standingResults = await orm.select().from(academicStanding)

                return new Response(JSON.stringify(standingResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})
