import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const partOfTerm = sqliteTable("part_of_term", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});