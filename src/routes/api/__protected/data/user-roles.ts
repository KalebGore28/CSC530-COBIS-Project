import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'
import { userRoles } from '@/db/schema'

type UserRole = typeof userRoles.$inferSelect

export const Route = createFileRoute('/api/__protected/data/user-roles')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                // Only allow if user is cobis_administrator
                if (!context.roles.has('cobis_administrator')) {
                    return new Response('Forbidden', { status: 403 })
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
            POST: async ({ request, context }) => {
                // Only allow if user is cobis_administrator
                if (!context.roles.has('cobis_administrator')) {
                    return new Response('Forbidden', { status: 403 })
                }

                const newUserRole: UserRole = await request.json()

                await context.db.insert(userRoles).values(newUserRole).execute()

                return new Response(null, { status: 201 })
            },
            DELETE: async ({ request, context }) => {
                // Only allow if user is cobis_administrator
                if (!context.roles.has('cobis_administrator')) {
                    return new Response('Forbidden', { status: 403 })
                }

                const deletedUserRole: UserRole = await request.json()

                // Make sure the admin doesn't delete their own admin role and lock themselves out
                if (
                    deletedUserRole.user_id === context.user.id &&
                    context.roles.has('cobis_administrator') &&
                    deletedUserRole.role_id === 4 // Cobis Administrator role ID
                ) {
                    return new Response('Forbidden', { status: 403 })
                }

                await context.db
                    .delete(userRoles)
                    .where(
                        and(
                            eq(userRoles.user_id, deletedUserRole.user_id),
                            eq(userRoles.role_id, deletedUserRole.role_id),
                        ),
                    )
                    .execute()

                return new Response(null, { status: 204 })
            },
        },
    },
})
