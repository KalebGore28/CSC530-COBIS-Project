import { createFileRoute } from '@tanstack/react-router'
import { faculty } from '@/db/schema'
import { gzipSync } from 'node:zlib'
import { eq } from 'drizzle-orm'

type Faculty = typeof faculty.$inferSelect

export const Route = createFileRoute('/api/__protected/data/faculty')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                // Check if user is either cobis_administrator or department_chair
                const user_roles = context.roles
                if (!user_roles.includes('cobis_administrator') && !user_roles.includes('department_chair')) {
                    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                        status: 403,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
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
                // Check if user is either cobis_administrator or department_chair
                const user_roles = context.roles
                if (!user_roles.includes('cobis_administrator') && !user_roles.includes('department_chair')) {
                    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                        status: 403,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                }

                const updatedFaculty: Faculty = await request.json()

                // First check if the faculty member is already assigned to a department
                const [existingFaculty] = await context.db
                    .select()
                    .from(faculty)
                    .where(eq(faculty.mnumber, updatedFaculty.mnumber))

                if (existingFaculty.department_code) {
                    return new Response(
                        JSON.stringify({ error: 'Faculty member is already assigned to a department. If you are trying to change the department, please contact an administrator.' }),
                        {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    )
                }

                await context.db
                    .update(faculty)
                    .set({
                        department_code: updatedFaculty.department_code,
                        // college_code: updatedFaculty.college_code, // Uncomment if college_code is allowed to be updated
                    })
                    .where(eq(faculty.mnumber, updatedFaculty.mnumber))
                    .execute()

                return new Response(null, { status: 204 })
            }
        }
    }
})