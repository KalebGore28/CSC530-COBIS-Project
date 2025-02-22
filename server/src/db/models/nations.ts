import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const nations = sqliteTable("nations", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});