import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const advisors = sqliteTable("advisors", {
	id: text("id").primaryKey(),
	first_name: text("first_name").notNull(),
	last_name: text("last_name").notNull(),
	middle_name: text("middle_name").notNull(),
	suffix: text("suffix").notNull(),
});