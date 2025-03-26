import { sqliteTable, text, int, primaryKey, foreignKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { user } from "./betterAuth";
import { courses } from "./courses";
import { terms } from "./terms";

export const instructorCourses = sqliteTable("instructor_courses", {
	instructor_mnumber: text("instructor_mnumber").notNull().references(() => user.mnumber),
	term: text("term").notNull().references(() => terms.code),
	year: int("year").notNull(),
	course_subject: text("course_subject").notNull(),
	course_number: text("course_number").notNull(),
	course_suffix: text("course_suffix").notNull().default(""),
	role: text("role").notNull().default("Instructor"),
}, (table) => [
	primaryKey({ columns: [table.instructor_mnumber, table.term, table.year, table.course_subject, table.course_number, table.course_suffix] }),
	foreignKey({ columns: [table.course_subject, table.course_number, table.course_suffix], foreignColumns: [courses.subject, courses.number, courses.suffix] }),
]);

// Define relationships for DBML generation
export const instructorCoursesRelations = relations(instructorCourses, ({ one }) => ({
	instructor: one(user, {
		fields: [instructorCourses.instructor_mnumber],
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