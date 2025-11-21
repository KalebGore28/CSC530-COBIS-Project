import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { instructionalMethods } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/instructional-methods')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const instructionalMethodResults = await orm.select().from(instructionalMethods)

                const json = JSON.stringify(instructionalMethodResults)
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