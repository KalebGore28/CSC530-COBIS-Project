import { sqliteTable, text, int, primaryKey, foreignKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { permissions } from "./permissions";

export const userPermissions = sqliteTable("user_permissions", {
	user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	table_name: text("table_name").notNull(),
	column_name: text("column_name").notNull(),
}, (table) => [
	primaryKey({ columns: [table.user_id, table.table_name, table.column_name] }),
	foreignKey({
		columns: [table.table_name, table.column_name],
		foreignColumns: [permissions.table_name, permissions.column_name],
	}).onDelete("cascade"),
]);

export const userPermissionRelations = relations(userPermissions, ({ one }) => ({
	user: one(users, {
		fields: [userPermissions.user_id],
		references: [users.id],
	}),
	permission: one(permissions, {
		fields: [userPermissions.table_name, userPermissions.column_name],
		references: [permissions.table_name, permissions.column_name],
	}),
}));