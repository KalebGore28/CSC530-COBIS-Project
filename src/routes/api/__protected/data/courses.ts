import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { courses } from '@/db/schema'

type Course = typeof courses.$inferSelect

export const Route = createFileRoute('/api/__protected/data/courses')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                const courseResults = await context.db.select().from(courses)

                const json = JSON.stringify(courseResults)
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

                const updatedCourse: Course = await request.json()

                const { id, ...updateData } = updatedCourse

                await context.db
                    .update(courses)
                    .set({ ...updateData, last_updated: new Date() })
                    .where(eq(courses.id, id))
                    .execute()

                return new Response(null, { status: 204 })
            },
        },
    },
})
