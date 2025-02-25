import { sqliteTable, text, int, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { users } from "./users";
import { roles } from "./roles";

export const userRoles = sqliteTable("user_roles", {
	user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	role_id: int("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (table) => [
	primaryKey({ columns: [table.user_id, table.role_id] }),
]);

// Define relationships for DBML generation
export const userRolesOne = relations(userRoles, ({ one }) => ({
	user: one(users, { // User roles have a user
		fields: [userRoles.user_id],
		references: [users.id],
	}),
	role: one(roles, { // User roles have a role
		fields: [userRoles.role_id],
		references: [roles.id],
	}),
}));