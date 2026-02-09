import { gzipSync } from 'node:zlib'
import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { user } from '@/db/schema'

type User = typeof user.$inferSelect

export const Route = createFileRoute('/api/__protected/data/users')({
    server: {
        handlers: {
            GET: async ({ context }) => {
                const user_roles = context.roles

                let userResults = await context.db.select().from(user)

                // Filter results based on roles
                if (
                    !user_roles.has('cobis_administrator') &&
                    !user_roles.has('department_chair')
                ) {
                    // Filter to only the current user
                    userResults = userResults.filter(
                        (u) => u.id === context.user.id,
                    )
                }

                const json = JSON.stringify(userResults)
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
                const user_roles = context.roles

                // Only allow if user is cobis_administrator
                if (!user_roles.has('cobis_administrator')) {
                    return new Response('Forbidden', { status: 403 })
                }

                const updatedUser: User = await request.json()

                const { id, ...updateData } = updatedUser

                await context.db
                    .update(user)
                    .set({
                        ...updateData,
                        isEnabled:
                            context.user.mnumber === updatedUser.mnumber
                                ? true
                                : updateData.isEnabled, // prevent disabling self
                        createdAt: undefined, // prevent updating createdAt
                        lastLogin: undefined, // prevent updating lastLogin here
                        updatedAt: new Date(updateData.updatedAt), // ensure updatedAt is set to the provided value
                    })
                    .where(eq(user.id, id))
                    .execute()

                return new Response(null, { status: 204 })
            },
        },
    },
})
