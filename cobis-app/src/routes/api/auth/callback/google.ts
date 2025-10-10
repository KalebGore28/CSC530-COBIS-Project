// routes/api/auth/callback/google.ts
import { createFileRoute } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'

const restrictGoogleCallback = createMiddleware().server(async ({ next, request }) => {
    const url = new URL(request.url)
    const hd = url.searchParams.get('hd')
    const allowedDomains = ['murraystate.edu']

    if (!hd || !allowedDomains.includes(hd)) {
        return {
            response: new Response(
                JSON.stringify({ error: 'Access restricted to specific domains' }),
                {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                }
            ),
            request,
            pathname: url.pathname,
            context: undefined,
        }
    }

    return next()
})

export const Route = createFileRoute('/api/auth/callback/google')({
    server: {
        middleware: [restrictGoogleCallback],
    },
})
