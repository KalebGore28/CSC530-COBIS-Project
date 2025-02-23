import { sqliteTable, text, int, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { students } from "./students";
import { terms } from "./terms";
import { advisors } from "./advisors";

export const studentAdvisors = sqliteTable("student_advisors", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber),
	term: text("term").notNull().references(() => terms.code),
	year: int("year").notNull(),
	advisor_id: text("advisor_id").notNull().references(() => advisors.id),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.term, table.year, table.advisor_id] }),
]);

// Define relationships for DBML generation
export const studentAdvisorsOne = relations(studentAdvisors, ({ many, one }) => ({
	students: many(students), // Students have many advisors
	terms: many(terms), // Terms have many advisors
	advisors: many(advisors), // Advisors have many student advisors
	student: one(students, { // Student advisors have a student
		fields: [studentAdvisors.mnumber],
		references: [students.mnumber],
	}),
	term: one(terms, { // Student advisors have a term
		fields: [studentAdvisors.term],
		references: [terms.code],
	}),
	advisor: one(advisors, { // Student advisors have an advisor
		fields: [studentAdvisors.advisor_id],
		references: [advisors.id],
	}),
}));