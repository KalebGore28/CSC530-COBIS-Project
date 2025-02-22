import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const collegeCodes = sqliteTable("college_codes", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});