import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { importJobs } from '@/db/schema'
import { processImport } from '@/utils/process-import'

export const Route = createFileRoute('/api/__protected/import/$importId/start')({
    server: {
        handlers: {
            POST: async ({ params, context }) => {
                const { importId } = params

                // Verify job exists and is pending
                const [job] = await context.db
                    .select()
                    .from(importJobs)
                    .where(eq(importJobs.id, importId))
                    .limit(1)

                if (!job) {
                    return new Response(
                        JSON.stringify({ error: 'Import job not found' }),
                        {
                            status: 404,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    )
                }

                if (job.status !== 'pending') {
                    return new Response(
                        JSON.stringify({
                            error: `Import already ${job.status}`,
                            status: job.status,
                        }),
                        {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    )
                }

                // Start processing in background (don't await)
                processImport(importId, context.db).catch((err) => {
                    console.error(
                        `Background import ${importId} failed:`,
                        err,
                    )
                })

                // Return immediately
                return new Response(
                    JSON.stringify({ started: true, importId }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    },
                )
            },
        },
    },
})
