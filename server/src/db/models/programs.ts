import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

import { colleges } from "./colleges";
import { departments } from "./departments";

export const programs = sqliteTable("programs", {
	code: text().primaryKey(),
	description: text().notNull(),
	cip_code: text().notNull(),
	is_major: int({ mode: 'boolean' }).notNull().default(false),
	is_minor: int({ mode: 'boolean' }).notNull().default(false),
	has_concentration: int({ mode: 'boolean' }).notNull().default(false),
	is_discontinued: int({ mode: 'boolean' }).notNull().default(false),
	is_aacsb: int({ mode: 'boolean' }).notNull().default(false),
	department: text().notNull().references(() => departments.code),
	college: text().notNull().references(() => colleges.code),
	added_on: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Define relationships for DBML generation
export const programsOne = relations(programs, ({ many, one }) => ({
	colleges: many(colleges), // Colleges have many programs
	departments: many(departments), // Departments have many programs
	college: one(colleges, { // Programs have a college
		fields: [programs.college],
		references: [colleges.code],
	}),
	department: one(departments, { // Programs have a department
		fields: [programs.department],
		references: [departments.code],
	}),
}));