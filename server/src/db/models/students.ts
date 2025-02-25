import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentAcademicInfo } from "./student_academic_info";
import { overrides } from "./overrides";
import { previousColleges } from "./previous_colleges";
import { studentAddresses } from "./student_addresses";
import { studentAdvisors } from "./student_advisors";
import { studentCourses } from "./student_courses";
import { studentPrograms } from "./student_programs";
import { testScores } from "./test_scores";

export const students = sqliteTable("students", {
	mnumber: text("mnumber").primaryKey(),
	first_name: text("first_name").notNull(),
	middle_name: text("middle_name").notNull(),
	last_name: text("last_name").notNull(),
	suffix: text("suffix").notNull(),
	gender: text("gender").notNull(),
	birthdate: text().notNull(),
	citizenship: text("citizenship").notNull(),
	race_code: text("race_code").notNull(),
	race_description: text("race_description").notNull(),
	residency_code: text("residency_code").notNull(),
	residency_description: text("residency_description").notNull(),
	age: int("age").notNull(),
	cell_phone: text("cell_phone").notNull(),
});

export const studentsRelations = relations(students, ({ many }) => ({
	studentAcademicInfo: many(studentAcademicInfo),
	overrides: many(overrides),
	previousColleges: many(previousColleges),
	studentAddresses: many(studentAddresses),
	studentAdvisors: many(studentAdvisors),
	studentCourses: many(studentCourses),
	studentPrograms: many(studentPrograms),
	testScores: many(testScores),
}));