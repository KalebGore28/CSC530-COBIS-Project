import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { faculty, roles, userRoles } from '@/db/schema'
import { auth } from '@/lib/auth'

export const getAuthUser = createServerFn({ method: 'GET' }).handler(
    async ({ context }) => {
        const request = getRequest()
        const session = await auth.api.getSession({
            headers: request.headers,
        })

        if (session?.session) {
            const [dbFaculty] = await context.db
                .select({
                    firstName: faculty.first_name,
                    lastName: faculty.last_name,
                    department_id: faculty.department_id,
                    college_id: faculty.college_id,
                })
                .from(faculty)
                .where(eq(faculty.mnumber, session.user.mnumber || ''))
                .limit(1)

            const userRolesData = await context.db
                .select({
                    roleName: roles.name,
                })
                .from(userRoles)
                .innerJoin(roles, eq(userRoles.role_id, roles.id))
                .where(eq(userRoles.user_id, session.user.id))

            return {
                session: session.session,
                user: session.user,
                faculty: dbFaculty,
                roles: new Set(userRolesData.map((r) => r.roleName)),
            }
        }

        return null
    },
)
