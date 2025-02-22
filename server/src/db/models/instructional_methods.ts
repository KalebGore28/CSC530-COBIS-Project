import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const instructionalMethods = sqliteTable("instructional_methods", {
	code: text().primaryKey(),
	description: text().notNull(),
});