import { mysqlTable, text, int, primaryKey, check } from 'drizzle-orm/mysql-core';
import { sql, relations } from "drizzle-orm";

import { students } from "./students";
import { programs } from "./programs";
import { terms } from "./terms";

export const studentPrograms = mysqlTable("student_programs", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber, { onDelete: "cascade" }),
	term: text("term").notNull().references(() => terms.code),
	year: int("year").notNull(),
	type: text("type").notNull(),
	level: text("level").notNull(),
	program: text("program").notNull().references(() => programs.code),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.type, table.program] }),
	check("program_type", sql`${table.type} IN ('MAJOR', 'MINOR')`),
	check("program_level", sql`${table.level} IN ('UG', 'GR', 'PB')`),
]);

export type StudentProgram = typeof studentPrograms.$inferSelect;

// Define relationships for DBML generation
export const studentProgramRelations = relations(studentPrograms, ({ one, many }) => ({
	students: many(students), // There can be multiple rows for each student with different programs/types
	term: one(terms, { // Student programs have a term
		fields: [studentPrograms.term],
		references: [terms.code],
	}),
	program: one(programs, { // Student programs have a program
		fields: [studentPrograms.program],
		references: [programs.code],
	}),
}));