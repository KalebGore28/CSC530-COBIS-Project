import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentAcademicInfo } from "./student_academic_info";
import { instructorCourses } from "./instructor_courses";
import { overrides } from "./overrides";
import { studentAdvisors } from "./student_advisors";
import { studentCourses } from "./student_courses";
import { studentPrograms } from "./student_programs";

export const terms = sqliteTable("terms", {
	code: text().primaryKey(),
	description: text().notNull(),
});

export const termsRelations = relations(terms, ({ many }) => ({
	studentAcademicInfo: many(studentAcademicInfo),
	instructorCourses: many(instructorCourses),
	overrides: many(overrides),
	studentAdvisors: many(studentAdvisors),
	studentCourses: many(studentCourses),
	studentPrograms: many(studentPrograms),
}));