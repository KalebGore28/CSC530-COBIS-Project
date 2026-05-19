import { createFileRoute } from '@tanstack/react-router'
import { writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'
import { tmpdir } from 'os'
import { join } from 'path'
import { importJobs } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/import/upload')({
    server: {
        handlers: {
            POST: async ({ request, context }) => {
                const formData = await request.formData()
                const file = formData.get('file') as File | null

                if (!file || file.size === 0) {
                    return new Response(
                        JSON.stringify({ error: 'No file provided' }),
                        {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    )
                }

                if (!file.name.endsWith('.csv')) {
                    return new Response(
                        JSON.stringify({ error: 'File must be a CSV' }),
                        {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    )
                }

                const importId = randomUUID()
                const tmpPath = join(tmpdir(), `${importId}.csv`)

                // Write file buffer to tmp
                const buffer = await file.arrayBuffer()
                await writeFile(tmpPath, Buffer.from(buffer))

                // Insert the job row into DB
                await context.db.insert(importJobs).values({
                    id: importId,
                    status: 'pending',
                    createdAt: new Date(),
                })

                return new Response(JSON.stringify({ importId }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            },
        },
    },
})
