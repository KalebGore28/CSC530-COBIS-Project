import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { academicStanding } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/academic-standing')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const standingResults = await orm.select().from(academicStanding)

                const json = JSON.stringify(standingResults)
                const compressed = gzipSync(Buffer.from(json))

                return new Response(compressed, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Encoding': 'gzip',
                    },
                })
            }
        }
    }
})
