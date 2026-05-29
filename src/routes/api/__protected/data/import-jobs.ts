import { createFileRoute } from '@tanstack/react-router'
import { desc } from 'drizzle-orm'
import { gzipSync } from 'zlib'
import { importJobs } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/import-jobs')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                // Get all import jobs ordered by most recent first
                const jobs = await context.db
                    .select()
                    .from(importJobs)
                    .orderBy(desc(importJobs.createdAt))

                // Compress response
                const compressed = gzipSync(Buffer.from(JSON.stringify(jobs)))

                return new Response(compressed, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Encoding': 'gzip',
                    },
                })
            },
        },
    },
})
