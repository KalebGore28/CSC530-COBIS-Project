import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { faculty, roles, userRoles } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getEffectiveRoles, loadCapabilities, loadDataGrants } from "@/utils/data-access";

export const getAuthUser = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const request = getRequest();
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session?.session) {
    const [dbFaculty] = await context.db
      .select({
        firstName: faculty.first_name,
        lastName: faculty.last_name,
        department_id: faculty.department_id,
        college_id: faculty.college_id,
      })
      .from(faculty)
      .where(eq(faculty.mnumber, session.user.mnumber || ""))
      .limit(1);

    const userRolesData = await context.db
      .select({
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.role_id, roles.id))
      .where(eq(userRoles.user_id, session.user.id));

    const assignedRoles = new Set(userRolesData.map((r) => r.roleName));
    const effectiveRoles = await getEffectiveRoles(
      context.db,
      session.user.mnumber ?? null,
      assignedRoles,
    );
    const [capabilities, dataGrants] = await Promise.all([
      loadCapabilities(context.db, effectiveRoles),
      loadDataGrants(context.db, effectiveRoles),
    ]);

    return {
      session: session.session,
      user: session.user,
      faculty: dbFaculty,
      roles: assignedRoles,
      capabilities,
      dataGrants,
    };
  }

  return null;
});
