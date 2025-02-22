import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const collegeCodes = sqliteTable("college_codes", {
	code: text().primaryKey(),
	description: text().notNull(),
});