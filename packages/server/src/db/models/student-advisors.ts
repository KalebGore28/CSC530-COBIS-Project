import { mysqlTable, int, primaryKey, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { students } from "./students";
import { terms } from "./terms";

export const studentAdvisors = mysqlTable("student_advisors", {
	student_mnumber: varchar("student_mnumber", { length: 10 }).notNull().references(() => students.mnumber, { onDelete: "cascade" }),
	term: varchar("term", { length: 50 }).notNull().references(() => terms.code),
	year: int("year").notNull(),
	advisor_mnumber: varchar("advisor_mnumber", { length: 10 }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.student_mnumber, table.term, table.year, table.advisor_mnumber] }),
]);

export type StudentAdvisor = typeof studentAdvisors.$inferSelect;

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
	// left out faculty relationship since it isn't guaranteed to be in the faculty table.
	// the advisor info is given by the demographics csv. the faculty table is populated
	// from the reg_cuba_courses_during_term.csv file, so it may not have all advisors.
	// so we just don't declare the relationship here. we can use sql to get the
	// advisor info from the faculty table if needed.
}));