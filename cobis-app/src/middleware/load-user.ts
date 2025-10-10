import { createMiddleware } from '@tanstack/react-start'
import { getDbConnection } from '@/db'
import { auth } from '@/lib/server/auth'
import { user, userRoles, roles, faculty } from '@/db/schema'
import { eq } from "drizzle-orm";

export const loadUser = createMiddleware().server(async ({ next, request }) => {
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
                mnumber: null,
                isEnabled: false,
                roles: [],
                faculty: {
                    firstName: '',
                    lastName: '',
                    department: '',
                    college: '',
                },
            },
        }
    }

    const { orm } = await getDbConnection()

    const dbUser = await orm
        .select({
            mnumber: user.mnumber,
            isEnabled: user.isEnabled,
        })
        .from(user)
        .where(eq(user.id, session.user.id))
        .then((res) => res[0] || null)

    const dbUserRoles = await orm
        .select({
            roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.role_id, roles.id))
        .where(eq(userRoles.user_id, session.user.id))
        .then((res) => res.map((r) => r.roleName))

    const facultyInfo = await orm
        .select({
            firstName: faculty.first_name,
            lastName: faculty.last_name,
            department: faculty.department,
            college: faculty.college,
        })
        .from(faculty)
        .where(eq(faculty.mnumber, dbUser?.mnumber || ''))
        .then((res) => res[0] || null)

    // Otherwise, continue
    return next({
        context: {
            mnumber: dbUser?.mnumber || null,
            isEnabled: dbUser?.isEnabled || false,
            roles: dbUserRoles || [],
            faculty: facultyInfo || null,
        },
    })
})