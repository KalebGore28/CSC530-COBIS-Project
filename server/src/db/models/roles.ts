import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const roles = sqliteTable("roles", {
	id: int("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
});