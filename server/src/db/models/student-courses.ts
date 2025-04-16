import { sqliteTable, text, int, primaryKey, foreignKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { terms } from "./terms";
import { students } from "./students";
import { partOfTerm } from "./part-of-term";
import { courses } from "./courses";
import { instructionalMethods } from "./instructional-methods";
import { registrationStatus } from "./registration-status";

export const studentCourses = sqliteTable("student_courses", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber),
	term: text("term").notNull().references(() => terms.code),
	year: int("year").notNull(),
	part_of_term: text("part_of_term").notNull().references(() => partOfTerm.code),
	crn: text("crn").notNull(),
	course_subject: text("course_subject").notNull(),
	course_number: int("course_number").notNull(),
	course_suffix: text("course_suffix").notNull().default(""),
	course_section: text("course_section").notNull(),
	course_hours: int("course_hours").notNull(),
	course_level: text("course_level").notNull(),
	registration_status: text("registration_status").notNull().references(() => registrationStatus.code),
	instructional_method: text("instructional_method").notNull().references(() => instructionalMethods.code),
	last_attendance: text("last_attendance"),
	midterm_grade: text("midterm_grade"),
	final_grade: text("final_grade"),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.term, table.year, table.crn] }),
	foreignKey({ columns: [table.course_subject, table.course_number, table.course_suffix], foreignColumns: [courses.subject, courses.number, courses.suffix] }),
]);

// Define relationships for DBML generation
export const studentCourseRelations = relations(studentCourses, ({ one }) => ({
	student: one(students, { // Student courses have a student
		fields: [studentCourses.mnumber],
		references: [students.mnumber],
	}),
	term: one(terms, { // Student courses have a term
		fields: [studentCourses.term],
		references: [terms.code],
	}),
	partOfTerm: one(partOfTerm, { // Student courses have a part of term
		fields: [studentCourses.part_of_term],
		references: [partOfTerm.code],
	}),
	course: one(courses, { // Student courses have a course
		fields: [studentCourses.course_subject, studentCourses.course_number, studentCourses.course_suffix],
		references: [courses.subject, courses.number, courses.suffix],
	}),
	registrationStatus: one(registrationStatus, { // Student courses have a registration status
		fields: [studentCourses.registration_status],
		references: [registrationStatus.code],
	}),
	instructionalMethod: one(instructionalMethods, { // Student courses have an instructional method
		fields: [studentCourses.instructional_method],
		references: [instructionalMethods.code],
	}),
}));