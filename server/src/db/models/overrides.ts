import { sqliteTable, text, int, foreignKey } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

import { students } from "./students";
import { courses } from "./courses";
import { terms } from "./terms";

export const overrides = sqliteTable("overrides", {
	id: int("id").notNull().primaryKey(),
	mnumber: text("mnumber").notNull().references(() => students.mnumber),
	term: text("term").notNull().references(() => terms.code),
	year: int("year").notNull(),
	crn: text("crn").notNull(),
	course_subject: text("subject").notNull(),
	course_number: text("number").notNull(),
	course_suffix: text("suffix").notNull().default(""),
	section: text("section").notNull(),
	override_type: text("override_type").notNull(),
	granted_by: text("granted_by").notNull(),
	override_date: int({ mode: "timestamp" }).notNull(),
}, (table) => [
	foreignKey({ columns: [table.course_subject, table.course_number, table.course_suffix], foreignColumns: [courses.subject, courses.number, courses.suffix] }),
]);

// Define relationships for DBML generation
export const overridesOne = relations(overrides, ({ many, one }) => ({
	students: many(students), // Students have many overrides
	courses: many(courses), // Courses have many overrides
	terms: many(terms), // Terms have many overrides
	student: one(students, { // Overrides have a student
		fields: [overrides.mnumber],
		references: [students.mnumber],
	}),
	course: one(courses, { // Overrides have a course
		fields: [overrides.course_subject, overrides.course_number, overrides.course_suffix],
		references: [courses.subject, courses.number, courses.suffix],
	}),
	term: one(terms, { // Overrides have a term
		fields: [overrides.term],
		references: [terms.code],
	}),
}));