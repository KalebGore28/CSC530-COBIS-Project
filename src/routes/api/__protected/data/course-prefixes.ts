import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { coursePrefixes } from '@/db/schema'

type CoursePrefixes = typeof coursePrefixes.$inferSelect

export const Route = createFileRoute('/api/__protected/data/course-prefixes')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                const coursePrefixesResults = await context.db
                    .select()
                    .from(coursePrefixes)

                const json = JSON.stringify(coursePrefixesResults)
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

                const updatedCoursePrefix: CoursePrefixes = await request.json()

                const { id, ...updateData } = updatedCoursePrefix

                await context.db
                    .update(coursePrefixes)
                    .set(updateData)
                    .where(eq(coursePrefixes.id, id))
                    .execute()

                return new Response(null, { status: 204 })
            },
        },
    },
})
