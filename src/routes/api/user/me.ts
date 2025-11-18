// src/routes/api/user/me.ts
import { createFileRoute } from '@tanstack/react-router'
import { loadUser } from '@/middleware/load-user'
import { auth } from '@/lib/server/auth'

export const Route = createFileRoute('/api/user/me')({
    server: {
        middleware: [loadUser],
        handlers: {
            GET: async ({ request, context }) => {
                const { mnumber, isEnabled, roles, faculty } = context;
                const session = await auth.api.getSession({
                    headers: request.headers,
                });

                if (!session) {
                    return new Response(
                        JSON.stringify({ error: 'Unauthorized' }),
                        {
                            status: 401,
                            headers: { 'Content-Type': 'application/json' },
                        }
                    );
                }

                const { user } = session;

                return new Response(JSON.stringify({ user, mnumber, isEnabled, roles, faculty }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            },
        },
    },
})

export type UserInfoResponse = {
    user: {
        id: string
        name: string | null
        email: string
        image?: string | null
        createdAt?: string | Date
        updatedAt?: string | Date
    }
    mnumber: string | null
    isEnabled: boolean
    roles: string[]
    faculty: {
        firstName: string
        lastName: string
        department: string
        college: string
    }
}