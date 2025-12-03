import { createFileRoute } from '@tanstack/react-router'
import { instructionalMethods } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/instructional-methods')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                const instructionalMethodResults = await context.db.select().from(instructionalMethods)

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