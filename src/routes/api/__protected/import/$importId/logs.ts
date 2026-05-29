import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { access, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { importJobs } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/import/$importId/logs')({
    server: {
        handlers: {
            GET: async ({ params, context }) => {
                const { importId } = params

                // Verify import job exists
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

                // Check if log file exists
                const logPath = join(tmpdir(), `${importId}.log`)
                try {
                    await access(logPath)
                } catch {
                    return new Response(
                        JSON.stringify({
                            error: 'Log file not found or has been cleaned up',
                        }),
                        {
                            status: 404,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    )
                }

                // Read and stream log file
                const logContent = await readFile(logPath, 'utf-8')

                return new Response(logContent, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/plain',
                        'Content-Disposition': `attachment; filename="import-${importId}.log"`,
                        'Cache-Control': 'no-cache',
                    },
                })
            },
        },
    },
})
