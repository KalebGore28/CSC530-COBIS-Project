import { mysqlTable, int, primaryKey, foreignKey, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { user } from "./betterAuth";
import { courses } from "./courses";
import { terms } from "./terms";

export const instructorCourses = mysqlTable("instructor_courses", {
	mnumber: varchar("mnumber", { length: 10 }).notNull().references(() => user.mnumber),
	term: varchar("term", { length: 50 }).notNull().references(() => terms.code),
	year: int("year").notNull(),
	crn: varchar("crn", { length: 50 }).notNull(),
	course_subject: varchar("course_subject", { length: 50 }).notNull(),
	course_number: int("course_number").notNull(),
	course_suffix: varchar("course_suffix", { length: 50 }).notNull().default(""),
	course_section: varchar("course_section", { length: 50 }).notNull().default(""),
	role: varchar("role", { length: 50 }).notNull().default("Instructor"),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.term, table.year, table.crn] }),
	foreignKey({ columns: [table.course_subject, table.course_number, table.course_suffix], foreignColumns: [courses.subject, courses.number, courses.suffix] }),
]);

export type InstructorCourse = typeof instructorCourses.$inferSelect;

// Define relationships for DBML generation
export const instructorCoursesRelations = relations(instructorCourses, ({ one }) => ({
	instructor: one(user, {
		fields: [instructorCourses.mnumber],
		references: [user.mnumber],
	}),
	course: one(courses, {
		fields: [instructorCourses.course_subject, instructorCourses.course_number, instructorCourses.course_suffix],
		references: [courses.subject, courses.number, courses.suffix],
	}),
	term: one(terms, {
		fields: [instructorCourses.term],
		references: [terms.code],
	}),
}));