import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { userRoles } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/user-roles')({
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

                const { orm } = await getDbConnection()

                const userRolesResults = await orm.select().from(userRoles)

                return new Response(JSON.stringify(userRolesResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})

