import { mysqlTable, int, primaryKey, foreignKey, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { terms } from "./terms";
import { students } from "./students";
import { partOfTerm } from "./part-of-term";
import { courses } from "./courses";
import { instructionalMethods } from "./instructional-methods";
import { registrationStatus } from "./registration-status";

export const studentCourses = mysqlTable("student_courses", {
	mnumber: varchar("mnumber", { length: 10 }).notNull().references(() => students.mnumber, { onDelete: "cascade" }),
	term: varchar("term", { length: 50 }).notNull().references(() => terms.code),
	year: int("year").notNull(),
	part_of_term: varchar("part_of_term", { length: 50 }).notNull().references(() => partOfTerm.code),
	crn: varchar("crn", { length: 50 }).notNull(),
	course_subject: varchar("course_subject", { length: 50 }).notNull(),
	course_number: int("course_number").notNull(),
	course_suffix: varchar("course_suffix", { length: 50 }).notNull().default(""),
	course_section: varchar("course_section", { length: 50 }).notNull(),
	course_hours: int("course_hours").notNull(),
	course_level: varchar("course_level", { length: 50 }).notNull(),
	registration_status: varchar("registration_status", { length: 50 }).notNull().references(() => registrationStatus.code),
	instructional_method: varchar("instructional_method", { length: 50 }).notNull().references(() => instructionalMethods.code),
	last_attendance: varchar("last_attendance", { length: 50 }),
	midterm_grade: varchar("midterm_grade", { length: 50 }),
	final_grade: varchar("final_grade", { length: 50 }),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.term, table.year, table.crn] }),
	foreignKey({ columns: [table.course_subject, table.course_number, table.course_suffix], foreignColumns: [courses.subject, courses.number, courses.suffix] }),
]);

export type StudentCourse = typeof studentCourses.$inferSelect;

// Define relationships for DBML generation
export const studentCourseRelations = relations(studentCourses, ({ one }) => ({
	student: one(students, {
		fields: [studentCourses.mnumber],
		references: [students.mnumber],
	}),
	term: one(terms, {
		fields: [studentCourses.term],
		references: [terms.code],
	}),
	partOfTerm: one(partOfTerm, {
		fields: [studentCourses.part_of_term],
		references: [partOfTerm.code],
	}),
	course: one(courses, {
		fields: [studentCourses.course_subject, studentCourses.course_number, studentCourses.course_suffix],
		references: [courses.subject, courses.number, courses.suffix],
	}),
	registrationStatus: one(registrationStatus, {
		fields: [studentCourses.registration_status],
		references: [registrationStatus.code],
	}),
	instructionalMethod: one(instructionalMethods, {
		fields: [studentCourses.instructional_method],
		references: [instructionalMethods.code],
	}),
}));