import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentCourses } from "./student-courses";

export const registrationStatus = sqliteTable("registration_status", {
	code: text().primaryKey(),
	description: text().notNull(),
});

export const registrationStatusRelations = relations(registrationStatus, ({ many }) => ({
	studentCourses: many(studentCourses),
}));