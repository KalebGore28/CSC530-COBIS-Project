import { createMiddleware } from '@tanstack/react-start'
import { getDbConnection } from '@/db'
import { auth } from '@/lib/server/auth'

export const requireAuth = createMiddleware().server(async ({ next, request }) => {
    // Use your auth library (BetterAuth, Lucia, Clerk, etc.)
    const session = await auth.api.getSession({ headers: request.headers })

    // If no user/session, redirect to login
    if (!session?.user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirectTo', request.url)
        return {
            response: Response.redirect(loginUrl.toString(), 302),
            request,
            pathname: new URL(request.url).pathname,
            context: {
                user: {
                    id: '',
                    createdAt: new Date(0),
                    updatedAt: new Date(0),
                    email: '',
                    emailVerified: false,
                    name: '',
                    image: null,
                },
            },
        }
    }

    // Otherwise, continue
    return next({
        context: {
            user: session.user,
        },
    })
})