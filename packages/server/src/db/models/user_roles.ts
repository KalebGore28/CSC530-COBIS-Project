import { mysqlTable, text, int, primaryKey } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { user } from "./betterAuth";
import { roles } from "./roles";

export const userRoles = mysqlTable("user_roles", {
	user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	role_id: int("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (table) => [
	primaryKey({ columns: [table.user_id, table.role_id] }),
]);

export type UserRole = typeof userRoles.$inferSelect;

// Define relationships for DBML generation
export const userRolesOne = relations(userRoles, ({ one }) => ({
	user: one(user, { // User roles have a user
		fields: [userRoles.user_id],
		references: [user.id],
	}),
	role: one(roles, { // User roles have a role
		fields: [userRoles.role_id],
		references: [roles.id],
	}),
}));