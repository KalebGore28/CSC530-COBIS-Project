import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const permissions = sqliteTable("permissions", {
	id: int("id").primaryKey({ autoIncrement: true }),
	table_name: text("name").notNull(),
	column_name: text("column_name").notNull(),
	can_read: int({ mode: "boolean" }).notNull().default(false),
	can_write: int({ mode: "boolean" }).notNull().default(false),
	description: text("description").notNull(),
});