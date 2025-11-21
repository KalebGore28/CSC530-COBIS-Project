import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { courses } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/courses')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const courseResults = await orm.select().from(courses)

                const json = JSON.stringify(courseResults)
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
