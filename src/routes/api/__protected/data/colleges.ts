import { createFileRoute } from '@tanstack/react-router'
import { colleges } from '@/db/schema'
import { gzipSync } from 'node:zlib'

export const Route = createFileRoute('/api/__protected/data/colleges')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                const collegeResults = await context.db.select().from(colleges)

                const json = JSON.stringify(collegeResults)
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