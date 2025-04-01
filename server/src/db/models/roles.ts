import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { rolePermissions } from "./role-permissions";
import { userRoles } from "./user_roles";

export const roles = sqliteTable("roles", {
	id: int("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
});

export const roleRelations = relations(roles, ({ many }) => ({
	rolePermissions: many(rolePermissions),
	userRoles: many(userRoles),
}));