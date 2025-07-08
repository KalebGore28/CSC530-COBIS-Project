import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { studentCourses } from "./student-courses";

export const registrationStatus = mysqlTable("registration_status", {
	code: varchar("code", { length: 50 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export type RegistrationStatus = typeof registrationStatus.$inferSelect;

export const registrationStatusRelations = relations(registrationStatus, ({ many }) => ({
	studentCourses: many(studentCourses),
}));