import { createMiddleware } from '@tanstack/react-start'
import { loadUser } from './load-user'

export const requireCobisAdmin = createMiddleware()
    .middleware([loadUser])
    .server(async ({ next, request, context }) => {
        const roles = context.roles

        if (!roles || !roles.has('cobis_administrator')) {
            return {
                response: new Response('Forbidden', { status: 403 }),
                request,
                pathname: new URL(request.url).pathname,
                context,
            }
        }

        return next()
    })
