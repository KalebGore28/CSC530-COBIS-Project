import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { faculty } from '@/db/schema'

type Faculty = typeof faculty.$inferSelect

export const Route = createFileRoute('/api/__protected/data/faculty')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                // Check if user is either cobis_administrator or department_chair
                const user_roles = context.roles
                if (
                    !user_roles.has('cobis_administrator') &&
                    !user_roles.has('department_chair')
                ) {
                    return new Response(
                        JSON.stringify({ error: 'Unauthorized' }),
                        {
                            status: 403,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                    )
                }

                const facultyResults = await context.db.select().from(faculty)

                const json = JSON.stringify(facultyResults)
                const compressed = gzipSync(Buffer.from(json))

                return new Response(compressed, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Encoding': 'gzip',
                    },
                })
            },
            PUT: async ({ context, request }) => {
                const user_roles = context.roles

                // Only allow if user is cobis_administrator
                if (!user_roles.has('cobis_administrator')) {
                    return new Response('Forbidden', { status: 403 })
                }

                const updatedFaculty: Faculty = await request.json()

                console.log('Received update for faculty:', updatedFaculty)

                const { mnumber, ...updateData } = updatedFaculty

                await context.db
                    .update(faculty)
                    .set({
                        ...updateData,
                        first_name: undefined, // prevent updating first_name
                        last_name: undefined, // prevent updating last_name
                    })
                    .where(eq(faculty.mnumber, updatedFaculty.mnumber))
                    .execute()

                return new Response(null, { status: 204 })
            },
        },
    },
})
