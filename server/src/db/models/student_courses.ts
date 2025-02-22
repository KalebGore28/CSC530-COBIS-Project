import { sqliteTable, text, int, primaryKey, check, real, foreignKey } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

import { terms } from "./terms";
import { students } from "./students";
import { partOfTerm } from "./part_of_term";
import { courses } from "./courses";
import { instructionalMethods } from "./instructional_methods";
import { registrationStatus } from "./registration_status";

export const studentCourses = sqliteTable("student_courses", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber),
	term: text("term_code").notNull().references(() => terms.code),
	year: int("year").notNull(),
	part_of_term: text("part_of_term_code").notNull().references(() => partOfTerm.code),
	crn: text("crn").notNull(),
	course_subject: text("subject").notNull(),
	course_number: text("number").notNull(),
	course_suffix: text("suffix").notNull(),
	course_section: text("section").notNull(),
	course_hours: int("hours").notNull(),
	course_level: text("level").notNull(),
	registration_status: text("registration_status_code").notNull().references(() => registrationStatus.code),
	instructional_method: text("instructional_method_code").notNull().references(() => instructionalMethods.code),
	last_attendance: int({ mode: "timestamp" }),
	midterm_grade: real(),
	final_grade: real(),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.term, table.year, table.crn] }),
	foreignKey({ columns: [table.course_subject, table.course_number, table.course_suffix], foreignColumns: [courses.subject, courses.number, courses.suffix] }),
]);

// Define relationships for DBML generation
export const studentCoursesMany = relations(studentCourses, ({ one }) => ({
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