import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { loadUser } from '@/middleware/load-user'
import { isEnabled } from '@/middleware/is-enabled'
import { requireCobisAdmin } from '@/middleware/require-cobis-admin'
import { faculty, user, userRoles } from '@/db/schema'

export const Route = createFileRoute('/api/__protected/user/provision')({
    server: {
        middleware: [loadUser, isEnabled, requireCobisAdmin],
        handlers: {
            POST: async ({ request, context }) => {
                const url = new URL(request.url)
                const mnumber = url.searchParams.get('mnumber')
                const userIsEnabled = url.searchParams.get('isEnabled')
                const college = url.searchParams.get('college')
                const department = url.searchParams.get('department')
                const role_ids = url.searchParams.getAll('role_id')
                const userId = url.searchParams.get('userId')

                if (
                    !mnumber ||
                    !userIsEnabled ||
                    !college ||
                    !department ||
                    role_ids.length === 0 ||
                    !userId
                ) {
                    return new Response(
                        JSON.stringify({
                            error: 'Missing required parameters',
                        }),
                        {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    )
                }

                console.log('Provisioning user with params:', {
                    mnumber,
                    userIsEnabled,
                    college,
                    department,
                    role_ids,
                    userId,
                })

                // Fetch the user to be provisioned
                const dbUser = await context.db
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
                        },
                    )
                }

                // Check if user is trying to disable themselves
                if (context.user.id === userId && userIsEnabled === 'false') {
                    return new Response(
                        JSON.stringify({
                            error: 'You cannot disable your own account',
                        }),
                        {
                            status: 403,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    )
                }

                const COBIS_ADMINISTRATOR_ROLE_ID = 6

                // Check if an admin is trying to remove their own admin role (cobis_administrator)
                if (
                    context.user.id === userId &&
                    !role_ids.includes(COBIS_ADMINISTRATOR_ROLE_ID.toString())
                ) {
                    return new Response(
                        JSON.stringify({
                            error: 'You cannot remove your own administrator role',
                        }),
                        {
                            status: 403,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    )
                }

                // Update user details
                await context.db
                    .update(user)
                    .set({
                        mnumber,
                        isEnabled: userIsEnabled === 'true',
                    })
                    .where(eq(user.id, userId))

                // Update faculty college, department details
                await context.db
                    .update(faculty)
                    .set({
                        college_id: college,
                        department_id: department,
                    })
                    .where(eq(faculty.mnumber, mnumber))

                // Update user roles
                // First, remove existing roles
                await context.db
                    .delete(userRoles)
                    .where(eq(userRoles.user_id, userId))

                // Then, add new roles
                for (const role_id of role_ids) {
                    await context.db.insert(userRoles).values({
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
