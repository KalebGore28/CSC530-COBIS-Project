import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { departments } from '@/db/schema'

type Department = typeof departments.$inferSelect

export const Route = createFileRoute('/api/__protected/data/departments')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                const departmentResults = await context.db
                    .select()
                    .from(departments)

                const json = JSON.stringify(departmentResults)
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

                const updatedDepartment: Department = await request.json()

                const { id, ...updateData } = updatedDepartment

                await context.db
                    .update(departments)
                    .set(updateData)
                    .where(eq(departments.id, id))
                    .execute()

                return new Response(null, { status: 204 })
            },
        },
    },
})
