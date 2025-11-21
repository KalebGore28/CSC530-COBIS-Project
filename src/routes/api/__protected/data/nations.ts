import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { nations } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/nations')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const nationResults = await orm.select().from(nations)

                const json = JSON.stringify(nationResults)
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