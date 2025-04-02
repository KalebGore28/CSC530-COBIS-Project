import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const instructors = sqliteTable("instructors", {
	mnumber: text("mnumber").primaryKey(),
	first_name: text("first_name").notNull(),
	last_name: text("last_name").notNull(),
});