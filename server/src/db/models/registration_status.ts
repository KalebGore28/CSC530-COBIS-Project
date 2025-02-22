import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const registrationStatus = sqliteTable("registration_status", {
	code: text().primaryKey(),
	description: text().notNull(),
});