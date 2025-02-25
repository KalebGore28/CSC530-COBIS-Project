import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const terms = sqliteTable("terms", {
	code: text().primaryKey(),
	description: text().notNull(),
});