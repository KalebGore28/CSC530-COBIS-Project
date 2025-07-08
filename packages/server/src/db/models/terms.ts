import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { studentAcademicInfo } from "./student-academic-info";
import { instructorCourses } from "./instructor-courses";
import { studentAdvisors } from "./student-advisors";
import { studentCourses } from "./student-courses";
import { studentPrograms } from "./student-programs";

export const terms = mysqlTable("terms", {
	code: varchar("code", { length: 10 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export type Term = typeof terms.$inferSelect;

export const termsRelations = relations(terms, ({ many }) => ({
	studentAcademicInfo: many(studentAcademicInfo),
	instructorCourses: many(instructorCourses),
	studentAdvisors: many(studentAdvisors),
	studentCourses: many(studentCourses),
	studentPrograms: many(studentPrograms),
}));