import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const admitCodes = sqliteTable("admit_codes", {
	code: text().primaryKey(),
	description: text().notNull(),
});