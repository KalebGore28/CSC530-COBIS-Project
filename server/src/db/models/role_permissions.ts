import { sqliteTable, int, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { roles } from "./roles";
import { permissions } from "./permissions";

export const rolePermissions = sqliteTable("role_permissions", {
	role_id: int("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
	permission_id: int("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (table) => [
	primaryKey({ columns: [table.role_id, table.permission_id] }),
]);

// Define relationships for DBML generation
export const rolePermissionsOne = relations(rolePermissions, ({ many, one }) => ({
	roles: many(roles), // Roles have many role permissions
	permissions: many(permissions), // Permissions have many role permissions
	role: one(roles, { // Role permissions have a role
		fields: [rolePermissions.role_id],
		references: [roles.id],
	}),
	permission: one(permissions, { // Role permissions have a permission
		fields: [rolePermissions.permission_id],
		references: [permissions.id],
	}),
}));