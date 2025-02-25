import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const admitCodes = sqliteTable("admit_codes", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});