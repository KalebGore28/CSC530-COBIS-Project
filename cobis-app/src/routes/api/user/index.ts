import { createFileRoute } from '@tanstack/react-router'
import { loadUser } from '@/middleware/load-user'
import { requireCobisAdmin } from '@/middleware/require-cobis-admin'
import { getDbConnection } from '@/db'
import { user, userRoles, roles, faculty } from '@/db/schema'
import { eq, like, sql, SQL, and } from 'drizzle-orm'

export const Route = createFileRoute('/api/user/')({
    server: {
        middleware: [loadUser, requireCobisAdmin],
        handlers: {
            GET: async ({ request }) => {
                const url = new URL(request.url)
                const isEnabled = url.searchParams.get('isEnabled')
                const mnumber = url.searchParams.get('mnumber')
                const college = url.searchParams.get('college')
                const department = url.searchParams.get('department')
                const name = url.searchParams.get('name')
                const email = url.searchParams.get('email')
                const role = url.searchParams.get('role')

                const { orm } = await getDbConnection()

                const conditions: SQL[] = []; // Array to hold WHERE conditions

                // Build conditions based on filters
                if (isEnabled !== null) {
                    conditions.push(eq(user.isEnabled, isEnabled === 'true'));
                }
                if (mnumber) {
                    conditions.push(eq(user.mnumber, mnumber));
                }
                if (college) {
                    conditions.push(like(faculty.college, `%${college}%`));
                }
                if (department) {
                    conditions.push(like(faculty.department, `%${department}%`));
                }
                if (name) {
                    // Case-insensitive search for name
                    conditions.push(like(user.name, `%${name}%`));
                }
                if (email) {
                    // Case-insensitive search for email
                    conditions.push(like(user.email, `%${email}%`));
                }
                if (role) {
                    conditions.push(eq(roles.name, role));
                }

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
                            department: faculty.department,
                            college: faculty.college,
                        },
                    })
                    .from(user)
                    .leftJoin(faculty, eq(faculty.mnumber, user.mnumber))
                    .leftJoin(userRoles, eq(userRoles.user_id, user.id))
                    .leftJoin(roles, eq(userRoles.role_id, roles.id))
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

                const finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;

                const usersData = await finalQuery;

                return new Response(JSON.stringify({ users: usersData }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }
    }
})
