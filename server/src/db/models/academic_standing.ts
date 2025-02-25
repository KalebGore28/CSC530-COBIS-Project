import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const academicStanding = sqliteTable("academic_standing", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});