import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { admitCodes } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/admit-codes')({
    server: {
        handlers: {
            GET: async () => {
                const { orm } = await getDbConnection()

                const admitCodeResults = await orm.select().from(admitCodes)

                const json = JSON.stringify(admitCodeResults)
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
