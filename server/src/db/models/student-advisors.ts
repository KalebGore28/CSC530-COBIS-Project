import { sqliteTable, text, int, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { students } from "./students";
import { terms } from "./terms";

export const studentAdvisors = sqliteTable("student_advisors", {
	student_mnumber: text("student_mnumber").notNull().references(() => students.mnumber),
	term: text("term").notNull().references(() => terms.code),
	year: int("year").notNull(),
	advisor_mnumber: text("advisor_mnumber").notNull(),
}, (table) => [
	primaryKey({ columns: [table.student_mnumber, table.term, table.year, table.advisor_mnumber] }),
]);

// Define relationships for DBML generation
export const studentAdvisorRelations = relations(studentAdvisors, ({ one }) => ({
	student: one(students, { // Student advisors have a student
		fields: [studentAdvisors.student_mnumber],
		references: [students.mnumber],
	}),
	term: one(terms, { // Student advisors have a term
		fields: [studentAdvisors.term],
		references: [terms.code],
	}),
}));