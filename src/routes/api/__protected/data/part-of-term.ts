import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { partOfTerm } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/part-of-term')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                const partOfTermResults = await context.db
                    .select()
                    .from(partOfTerm)

                const json = JSON.stringify(partOfTermResults)
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
