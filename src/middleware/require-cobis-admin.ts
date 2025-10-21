import { createMiddleware } from '@tanstack/react-start'

export const requireCobisAdmin = createMiddleware().server(async ({ next, request, context }) => {
    // @ts-ignore
    const roles = context?.roles;

    if (!roles || !roles.includes('cobis_administrator')) {
        return {
            response: new Response('Forbidden', { status: 403 }),
            request,
            pathname: new URL(request.url).pathname,
            context,
        }
    }

    return next()
})