import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { userRoles } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/user-roles')({
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

                const userRolesResults = await context.db
                    .select()
                    .from(userRoles)

                const json = JSON.stringify(userRolesResults)
                const compressed = gzipSync(Buffer.from(json))

                return new Response(compressed, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Encoding': 'gzip',
                    },
                })
            },
        },
    },
})
