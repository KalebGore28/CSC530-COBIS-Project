import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { programs } from '@/db/schema'

type Program = typeof programs.$inferSelect

export const Route = createFileRoute('/api/__protected/data/programs')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                const programResults = await context.db.select().from(programs)

                const json = JSON.stringify(programResults)
                const compressed = gzipSync(Buffer.from(json))

                return new Response(compressed, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Encoding': 'gzip',
                    },
                })
            },
            PUT: async ({ request, context }) => {
                // Only allow if user is cobis_administrator
                if (!context.roles.has('cobis_administrator')) {
                    return new Response('Forbidden', { status: 403 })
                }

                const updatedProgram: Program = await request.json()

                const { id, ...updateData } = updatedProgram

                await context.db
                    .update(programs)
                    .set(updateData)
                    .where(eq(programs.id, id))
                    .execute()

                return new Response(null, { status: 204 })
            },
        },
    },
})
