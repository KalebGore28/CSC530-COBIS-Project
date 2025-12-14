import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { academicStanding } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/academic-standing')(
    {
        server: {
            handlers: {
                GET: async ({ context }) => {
                    const standingResults = await context.db
                        .select()
                        .from(academicStanding)

                    const json = JSON.stringify(standingResults)
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
    },
)
