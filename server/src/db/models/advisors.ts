import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const advisors = sqliteTable("advisors", {
	id: text().primaryKey(),
	first_name: text().notNull(),
	last_name: text().notNull(),
	middle_name: text().notNull(),
	suffix: text().notNull(),
});