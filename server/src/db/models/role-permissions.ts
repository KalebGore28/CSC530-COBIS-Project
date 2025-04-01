import { sqliteTable, int, text, primaryKey, foreignKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { roles } from "./roles";
import { permissions } from "./permissions";

export const rolePermissions = sqliteTable("role_permissions", {
	role_id: int("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
	table_name: text("table_name").notNull(),
	column_name: text("column_name").notNull(),
}, (table) => [
	primaryKey({ columns: [table.role_id, table.table_name, table.column_name] }),
	foreignKey({
		columns: [table.table_name, table.column_name],
		foreignColumns: [permissions.table_name, permissions.column_name],
	}).onDelete("cascade"),
]);

export const rolePermissionRelations = relations(rolePermissions, ({ one }) => ({
	role: one(roles, {
		fields: [rolePermissions.role_id],
		references: [roles.id],
	}),
	permission: one(permissions, {
		fields: [rolePermissions.table_name, rolePermissions.column_name],
		references: [permissions.table_name, permissions.column_name],
	}),
}));