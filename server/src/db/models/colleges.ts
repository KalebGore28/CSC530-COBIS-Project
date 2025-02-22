import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const colleges = sqliteTable("colleges", {
	code: text().primaryKey(),
	description: text().notNull(),
});