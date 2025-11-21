import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { registrationStatus } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/registration-status')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const statusResults = await orm.select().from(registrationStatus)

                const json = JSON.stringify(statusResults)
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