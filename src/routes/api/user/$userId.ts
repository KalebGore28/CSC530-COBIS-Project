import { createFileRoute } from '@tanstack/react-router'
import { loadUser } from '@/middleware/load-user'
import { requireCobisAdmin } from '@/middleware/require-cobis-admin'
import { getDbConnection } from '@/db'
import { user, userRoles, roles, faculty, colleges, departments } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export const Route = createFileRoute('/api/user/$userId')({
    server: {
        middleware: [loadUser, requireCobisAdmin],
        handlers: {
            GET: async ({ params }) => {
                const { userId } = params;

                const { orm } = await getDbConnection()

                const query = orm
                    .select({
                        id: user.id,
                        mnumber: user.mnumber,
                        email: user.email,
                        name: user.name,
                        isEnabled: user.isEnabled,
                        roles: sql<string>`JSON_ARRAYAGG(${roles.name})`.as('roles'),
                        faculty: {
                            firstName: faculty.first_name,
                            lastName: faculty.last_name,
                            department: departments.description,
                            college: colleges.description,
                        },
                    })
                    .from(user)
                    .leftJoin(faculty, eq(faculty.mnumber, user.mnumber))
                    .leftJoin(userRoles, eq(userRoles.user_id, user.id))
                    .leftJoin(roles, eq(userRoles.role_id, roles.id))
                    .leftJoin(colleges, eq(faculty.college, colleges.code))
                    .leftJoin(departments, eq(faculty.department, departments.code))
                    .where(eq(user.id, userId))
                    .groupBy(
                        user.id,
                        user.mnumber,
                        user.name,
                        user.email,
                        user.image,
                        user.isEnabled,
                        user.lastLogin,
                        user.createdAt,
                        faculty.college,
                        faculty.department
                    );

                const dbUsers = await query.then((res) => res || [])

                if (dbUsers.length === 0) {
                    return new Response(
                        JSON.stringify({ error: 'User not found' }),
                        {
                            status: 404,
                            headers: { 'Content-Type': 'application/json' },
                        }
                    )
                }

                const dbUser = dbUsers[0];

                return new Response(JSON.stringify(dbUser), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            }
        }
    }
})