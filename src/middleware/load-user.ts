import { createMiddleware } from '@tanstack/react-start'
import { user, userRoles, roles, faculty } from '@/db/schema'
import { eq } from "drizzle-orm";

export const loadUser = createMiddleware({ type: 'request' })
    .server(async ({ next, request, context }) => {
        const session = await context.auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
            return {
                response: new Response(
                    JSON.stringify({ error: 'Unauthorized', message: 'User not signed in' }),
                    {
                        status: 401,
                        headers: { 'Content-Type': 'application/json' },
                    }
                ),
                request,
                pathname: new URL(request.url).pathname,
                context: {
                    ...context, // carry over existing context
                    session: {
                        id: '',
                        createdAt: new Date(0),
                        updatedAt: new Date(0),
                        userId: '',
                        expiresAt: new Date(0),
                        token: '',
                        ipAddress: null,
                        userAgent: null,
                    },
                    user: {
                        id: '',
                        createdAt: new Date(0),
                        updatedAt: new Date(0),
                        email: '',
                        emailVerified: false,
                        name: '',
                        image: null,
                    },
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

        const combined = await context.db
            .select({
                mnumber: user.mnumber,
                isEnabled: user.isEnabled,
                roleName: roles.name,
                firstName: faculty.first_name,
                lastName: faculty.last_name,
                department: faculty.department_code,
                college: faculty.college_code,
            })
            .from(user)
            .leftJoin(userRoles, eq(userRoles.user_id, user.id))
            .leftJoin(roles, eq(userRoles.role_id, roles.id))
            .leftJoin(faculty, eq(faculty.mnumber, user.mnumber))
            .where(eq(user.id, session.user.id))

        // Handle aggregation — because a user may have multiple roles
        const base = combined[0]
        const rolesList = combined.map((r) => r.roleName).filter(Boolean)

        // Lastly update user last login
        await context.db
            .update(user)
            .set({ lastLogin: new Date() })
            .where(eq(user.id, session.user.id))

        return next({
            context: {
                ...context,
                session: session.session,
                user: session.user,
                mnumber: base?.mnumber || null,
                isEnabled: base?.isEnabled || false,
                roles: rolesList,
                faculty: base
                    ? {
                        firstName: base.firstName,
                        lastName: base.lastName,
                        department: base.department,
                        college: base.college,
                    }
                    : null,
            },
        })
    })
