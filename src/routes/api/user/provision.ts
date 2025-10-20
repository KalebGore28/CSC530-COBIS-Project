import { createFileRoute } from '@tanstack/react-router'
import { loadUser } from '@/middleware/load-user'
import { user, faculty, userRoles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getDbConnection } from '@/db'

export const Route = createFileRoute('/api/user/provision')({
    server: {
        middleware: [loadUser],
        handlers: {
            POST: async ({ request }) => {
                const url = new URL(request.url)
                const mnumber = url.searchParams.get('mnumber')
                const isEnabled = url.searchParams.get('isEnabled')
                const college = url.searchParams.get('college')
                const department = url.searchParams.get('department')
                const role_ids = url.searchParams.getAll('role_id')
                const userId = url.searchParams.get('userId')

                if (!mnumber || !isEnabled || !college || !department || role_ids.length === 0 || !userId) {
                    return new Response(
                        JSON.stringify({ error: 'Missing required parameters' }),
                        {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' },
                        }
                    )
                }

                const { orm } = await getDbConnection()

                // Fetch the user to be provisioned
                const dbUser = await orm
                    .select()
                    .from(user)
                    .where(eq(user.id, userId))
                    .limit(1)

                if (dbUser.length === 0) {
                    return new Response(
                        JSON.stringify({ error: 'User not found' }),
                        {
                            status: 404,
                            headers: { 'Content-Type': 'application/json' },
                        }
                    )
                }

                // Update user details
                await orm.update(user).set({
                    mnumber,
                    isEnabled: isEnabled === 'true'
                }).where(eq(user.id, userId))

                // Update faculty college, department details
                await orm.update(faculty).set({
                    college_code: college,
                    department_code: department,
                }).where(eq(faculty.mnumber, mnumber))

                // Update user roles
                // First, remove existing roles
                await orm.delete(userRoles).where(eq(userRoles.user_id, userId))

                // Then, add new roles
                for (const role_id of role_ids) {
                    await orm.insert(userRoles).values({
                        user_id: userId,
                        role_id: parseInt(role_id, 10),
                    })
                }
                
                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            },
        },
    },
})