import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
    server: {
        handlers: {
            GET: ({ request, context }) => {
                const url = new URL(request.url)

                if (url.pathname.startsWith('/api/auth/callback/google')) {
                    const hd = url.searchParams.get('hd') ?? undefined
                    const allowedDomains = ['murraystate.edu']

                    if (!hd || !allowedDomains.includes(hd)) {
                        return new Response(
                            JSON.stringify({
                                error: 'Access restricted to specific domains',
                            }),
                            {
                                status: 403,
                                headers: { 'Content-Type': 'application/json' },
                            },
                        )
                    }
                }

                return context.auth.handler(request)
            },
            POST: ({ request, context }) => {
                return context.auth.handler(request)
            },
        },
    },
})
