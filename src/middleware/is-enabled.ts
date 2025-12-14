import { createMiddleware } from '@tanstack/react-start'
import { loadUser } from '@/middleware/load-user'

export const isEnabled = createMiddleware({ type: 'request' })
    .middleware([loadUser])
    .server(async ({ next, context, request }) => {
        const pathname = new URL(request.url).pathname

        if (!context.user.isEnabled) {
            return {
                response: new Response(
                    JSON.stringify({
                        error: 'Forbidden',
                        message: 'User is not enabled',
                    }),
                    {
                        status: 403,
                        headers: { 'Content-Type': 'application/json' },
                    },
                ),
                request: request,
                pathname: pathname,
                context,
            }
        }

        return next()
    })
