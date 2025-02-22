import { sqliteTable, text, int, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { students } from "./students";
import { terms } from "./terms";
import { advisors } from "./advisors";

export const studentAdvisors = sqliteTable("student_advisors", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber),
	term_code: text("term_code").notNull().references(() => terms.code),
	year: int("year").notNull(),
	advisor_id: text("advisor_id").notNull().references(() => advisors.id),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.term_code, table.year, table.advisor_id] }),
]);

// Define relationships for DBML generation
export const studentAdvisorsOne = relations(studentAdvisors, ({ one }) => ({
	student: one(students, {
		fields: [studentAdvisors.mnumber],
		references: [students.mnumber],
	}),
	term: one(terms, {
		fields: [studentAdvisors.term_code],
		references: [terms.code],
	}),
	advisor: one(advisors, {
		fields: [studentAdvisors.advisor_id],
		references: [advisors.id],
	}),
}));