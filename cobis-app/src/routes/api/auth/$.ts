// routes/api/auth/$.ts
import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/lib/server/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url)
        console.log('Request URL:', url.href)

        if (url.pathname.startsWith('/api/auth/callback/google')) {
          const hd = url.searchParams.get('hd') ?? undefined
          const allowedDomains = ['murraystate.edu']

          if (!hd || !allowedDomains.includes(hd)) {
            return new Response(
              JSON.stringify({ error: 'Access restricted to specific domains' }),
              {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }
        }

        return auth.handler(request)
      },
      POST: ({ request }) => {
        return auth.handler(request)
      },
    },
  },
})