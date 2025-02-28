import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

import { imports } from "./imports";
import { instructorCourses } from "./instructor_courses";
import { userPermissions } from "./user_permissions";
import { userRoles } from "./user_roles";

export const users = sqliteTable("users", {
    id: text().primaryKey(),
    email: text().notNull().unique(),
    display_name: text().notNull(),
    is_active: int({ mode: 'boolean' }).notNull().default(false), // For security reasons, we'll default to false
    last_login: text().notNull().default(sql`CURRENT_TIMESTAMP`),
    created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many }) => ({
    imports: many(imports),
    instructor_courses: many(instructorCourses),
    user_permissions: many(userPermissions),
    user_roles: many(userRoles),
}));