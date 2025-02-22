import { sqliteTable, text, int, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { users } from "./users";
import { permissions } from "./permissions";

export const userPermissions = sqliteTable("user_permissions", {
	user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	permission_id: int("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (table) => [
	primaryKey({ columns: [table.user_id, table.permission_id] }),
]);

// Define relationships for DBML generation
export const userPermissionsOne = relations(userPermissions, ({ one }) => ({
	user: one(users, {
		fields: [userPermissions.user_id],
		references: [users.id],
	}),
	permission: one(permissions, {
		fields: [userPermissions.permission_id],
		references: [permissions.id],
	}),
}));