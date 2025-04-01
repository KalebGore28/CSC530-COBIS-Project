import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { rolePermissions } from "./role-permissions";
import { userPermissions } from "./user_permissions";

export const permissions = sqliteTable("permissions", {
	table_name: text("table_name").notNull(),
	column_name: text("column_name").notNull(),
}, (table) => [
	primaryKey({ columns: [table.table_name, table.column_name] }),
]);

export const permissionRelations = relations(permissions, ({ many }) => ({
	rolePermissions: many(rolePermissions),
	userPermissions: many(userPermissions),
}));