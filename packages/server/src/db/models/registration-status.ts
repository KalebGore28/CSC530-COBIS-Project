import { mysqlTable, text } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { studentCourses } from "./student-courses";

export const registrationStatus = mysqlTable("registration_status", {
	code: text().primaryKey(),
	description: text().notNull(),
});

export type RegistrationStatus = typeof registrationStatus.$inferSelect;

export const registrationStatusRelations = relations(registrationStatus, ({ many }) => ({
	studentCourses: many(studentCourses),
}));