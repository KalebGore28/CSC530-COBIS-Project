import { createFileRoute } from '@tanstack/react-router'
import { user } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/data/users')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                const user_roles = context.roles

                let userResults = await context.db.select().from(user)

                // Filter results based on roles
                if (!user_roles.includes('cobis_administrator') && !user_roles.includes('department_chair')) {
                    // Filter to only the current user
                    userResults = userResults.filter((u) => u.id === context.user.id)
                }

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