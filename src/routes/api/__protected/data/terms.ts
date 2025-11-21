import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { terms } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/terms')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const termResults = await orm.select().from(terms)

                const json = JSON.stringify(termResults)
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