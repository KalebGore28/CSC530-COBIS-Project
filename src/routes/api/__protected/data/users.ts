import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { user } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/users')({
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

                const userResults = await orm.select().from(user)

                return new Response(JSON.stringify(userResults), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            }
        }
    }
})