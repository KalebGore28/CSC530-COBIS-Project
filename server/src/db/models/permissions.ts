import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { rolePermissions } from "./role_permissions";
import { userPermissions } from "./user_permissions";

export const permissions = sqliteTable("permissions", {
	id: int("id").primaryKey({ autoIncrement: true }),
	table_name: text("name").notNull(),
	column_name: text("column_name").notNull(),
	can_read: int({ mode: "boolean" }).notNull().default(false),
	can_write: int({ mode: "boolean" }).notNull().default(false),
	description: text("description").notNull(),
});

export const permissionRelations = relations(permissions, ({ many }) => ({
	rolePermissions: many(rolePermissions),
	userPermissions: many(userPermissions),
}));