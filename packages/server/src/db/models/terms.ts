import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentAcademicInfo } from "./student-academic-info";
import { instructorCourses } from "./instructor-courses";
import { studentAdvisors } from "./student-advisors";
import { studentCourses } from "./student-courses";
import { studentPrograms } from "./student-programs";

export const terms = sqliteTable("terms", {
	code: text().primaryKey(),
	description: text().notNull(),
});

export const termsRelations = relations(terms, ({ many }) => ({
	studentAcademicInfo: many(studentAcademicInfo),
	instructorCourses: many(instructorCourses),
	studentAdvisors: many(studentAdvisors),
	studentCourses: many(studentCourses),
	studentPrograms: many(studentPrograms),
}));