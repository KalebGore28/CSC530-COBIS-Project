import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { admitCodes } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/admit-codes')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                const admitCodeResults = await context.db
                    .select()
                    .from(admitCodes)

                const json = JSON.stringify(admitCodeResults)
                const compressed = gzipSync(Buffer.from(json))

                return new Response(compressed, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Encoding': 'gzip',
                    },
                })
            },
        },
    },
})
