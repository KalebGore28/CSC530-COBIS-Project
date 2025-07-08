import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { studentAcademicInfo } from "./student-academic-info";
import { studentAddresses } from "./student-addresses";
import { studentAdvisors } from "./student-advisors";
import { studentCourses } from "./student-courses";
import { studentPrograms } from "./student-programs";

export const students = mysqlTable("students", {
	mnumber: varchar("mnumber", { length: 10 }).primaryKey(),
	first_name: varchar("first_name", { length: 50 }).notNull(),
	middle_name: varchar("middle_name", { length: 50 }).notNull(),
	last_name: varchar("last_name", { length: 50 }).notNull(),
	suffix: varchar("suffix", { length: 10 }).notNull(),
	gender: varchar("gender", { length: 10 }).notNull(),
	birthdate: varchar("birthdate", { length: 10 }).notNull(),
	citizenship: varchar("citizenship", { length: 50 }).notNull(),
	race_code: varchar("race_code", { length: 50 }).notNull(),
	race_description: varchar("race_description", { length: 50 }).notNull(),
	residency_code: varchar("residency_code", { length: 50 }).notNull(),
	residency_description: varchar("residency_description", { length: 50 }).notNull(),
	age: int("age").notNull(),
	cell_phone: varchar("cell_phone", { length: 15 }).notNull(),
	email: varchar("email", { length: 100 }).notNull(),
});

export type Student = typeof students.$inferSelect;

export const studentsRelations = relations(students, ({ many }) => ({
	studentAcademicInfo: many(studentAcademicInfo),
	studentAddresses: many(studentAddresses),
	studentAdvisors: many(studentAdvisors),
	studentCourses: many(studentCourses),
	studentPrograms: many(studentPrograms),
}));