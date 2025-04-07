import { sqliteTable, text, int, primaryKey, check } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

import { students } from "./students";
import { terms } from "./terms";
import { programs } from "./programs";

export const studentPrograms = sqliteTable("student_programs", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber),
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

// Define relationships for DBML generation
export const studentProgramRelations = relations(studentPrograms, ({ one }) => ({
	student: one(students, { // Student programs have a student
		fields: [studentPrograms.mnumber],
		references: [students.mnumber],
	}),
	term: one(terms, { // Student programs have a term
		fields: [studentPrograms.term],
		references: [terms.code],
	}),
	program: one(programs, { // Student programs have a program
		fields: [studentPrograms.program],
		references: [programs.code],
	}),
}));