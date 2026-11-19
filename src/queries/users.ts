import { Query, eq, ilike, or } from "@tanstack/react-db";

import { collegesCollection } from "@/integrations/tanstack-db/colleges";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { facultyCollection } from "@/integrations/tanstack-db/faculty";
import { usersCollection } from "@/integrations/tanstack-db/users";

/**
 * Users whose name, M-Number or email contains the search text, with their department and
 * college when they're faculty. An empty search matches everyone.
 */
export function userDirectoryQuery(search: string) {
  return new Query()
    .from({ users: usersCollection })
    .leftJoin({ faculty: facultyCollection }, ({ users, faculty }) =>
      eq(users.mnumber, faculty.mnumber),
    )
    .leftJoin({ departments: departmentsCollection }, ({ faculty, departments }) =>
      eq(faculty?.department_id, departments.id),
    )
    .leftJoin({ colleges: collegesCollection }, ({ faculty, colleges }) =>
      eq(faculty?.college_id, colleges.id),
    )
    .where(({ users }) =>
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.mnumber, `%${search}%`),
        ilike(users.email, `%${search}%`),
      ),
    )
    .orderBy(({ users }) => users.name, "asc")
    .select(({ users, departments, colleges }) => ({
      id: users.id,
      mnumber: users.mnumber,
      name: users.name,
      email: users.email,
      image: users.image,
      isEnabled: users.isEnabled,
      lastLogin: users.lastLogin,
      department_description: departments?.description,
      college_description: colleges?.description,
    }));
}
