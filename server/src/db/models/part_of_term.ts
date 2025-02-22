import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const partOfTerm = sqliteTable("part_of_term", {
	code: text().primaryKey(),
	description: text().notNull(),
});