import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const academicStanding = sqliteTable("academic_standing", {
	code: text().primaryKey(),
	description: text().notNull(),
});