import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { roles } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/roles')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const roleResults = await orm.select().from(roles)

                const json = JSON.stringify(roleResults)
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