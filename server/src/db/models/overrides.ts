import { sqliteTable, text, int, foreignKey, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { students } from "./students";
import { courses } from "./courses";
import { terms } from "./terms";

export const overrides = sqliteTable("overrides", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber),
	term: text("term").notNull().references(() => terms.code),
	year: int("year").notNull(),
	crn: text("crn").notNull(),
	course_subject: text("subject").notNull(),
	course_number: text("number").notNull(),
	course_suffix: text("suffix").notNull().default(""),
	course_section: text("section").notNull(),
	override_type: text("override_type").notNull(),
	granted_by: text("granted_by").notNull(),
	override_date: text("override_date").notNull(),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.term, table.year, table.crn] }),
	foreignKey({ columns: [table.course_subject, table.course_number, table.course_suffix], foreignColumns: [courses.subject, courses.number, courses.suffix] }),
]);

// Define relationships for DBML generation
export const overridesRelations = relations(overrides, ({ one }) => ({
	student: one(students, { // Each override has one student
		fields: [overrides.mnumber],
		references: [students.mnumber],
	}),
	course: one(courses, { // Each override has one course
		fields: [overrides.course_subject, overrides.course_number, overrides.course_suffix],
		references: [courses.subject, courses.number, courses.suffix],
	}),
	term: one(terms, { // Each override has one term
		fields: [overrides.term],
		references: [terms.code],
	}),
}));