import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/lib/server/auth'

export const Route = createFileRoute('/api/user/me')({
    server: {
        handlers: {
            GET: async ({ request }) => {
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

                return new Response(JSON.stringify({ user }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            },
        },
    },
})