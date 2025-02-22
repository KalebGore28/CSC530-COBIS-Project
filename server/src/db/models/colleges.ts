import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const colleges = sqliteTable("colleges", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});