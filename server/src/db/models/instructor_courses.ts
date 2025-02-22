import { sqliteTable, text, primaryKey, foreignKey } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

import { users } from "./users";
import { courses } from "./courses";
import { terms } from "./terms";

export const instructorCourses = sqliteTable("instructor_courses", {
	user_id: text("user_id").notNull().references(() => users.id),
	term: text("term").notNull().references(() => terms.code),
	course_subject: text("course_subject").notNull(),
	course_number: text("course_number").notNull(),
	course_suffix: text("course_suffix").notNull().default(""),
	role: text("role").notNull().default("Instructor"),
}, (table) => [
	primaryKey({ columns: [table.user_id, table.term, table.course_subject, table.course_number, table.course_suffix] }),
	foreignKey({ columns: [table.course_subject, table.course_number, table.course_suffix], foreignColumns: [courses.subject, courses.number, courses.suffix] }),
]);

// Define relationships for DBML generation
export const instructorCoursesOne = relations(instructorCourses, ({ many, one }) => ({
	users: many(users), // Users have many instructor courses
	courses: many(courses), // Courses have many instructor courses
	terms: many(terms), // Terms have many instructor courses
	instructor: one(users, { // Instructor courses have an instructor
		fields: [instructorCourses.user_id],
		references: [users.id],
	}),
	course: one(courses, { // Instructor courses have a course
		fields: [instructorCourses.course_subject, instructorCourses.course_number, instructorCourses.course_suffix],
		references: [courses.subject, courses.number, courses.suffix],
	}),
	term: one(terms, { // Instructor courses have a term
		fields: [instructorCourses.term],
		references: [terms.code],
	}),
}));