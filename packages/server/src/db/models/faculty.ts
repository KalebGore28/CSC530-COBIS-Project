import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { departments } from "./departments";
import { colleges } from "./colleges";

// Originally intended for all faculty, but now only for instructors
// since the table is only populated with faculty teaching courses
// from the reg_cuba_courses_during_term.csv file.
export const faculty = mysqlTable("faculty", {
	mnumber: varchar("mnumber", { length: 10 }).primaryKey(), // e.g
	first_name: varchar("first_name", { length: 50 }).notNull(),
	last_name: varchar("last_name", { length: 50 }).notNull(),
	college: varchar('college', { length: 50 }).references(() => colleges.code).default("0"),
	department: varchar('department', { length: 50 }).references(() => departments.code).default("0000"),
});

export type Faculty = typeof faculty.$inferSelect;

// Define relationships for DBML generation
export const facultyRelations = relations(faculty, ({ one }) => ({
	college: one(colleges, {
		fields: [faculty.college],
		references: [colleges.code],
	}),
	department: one(departments, {
		fields: [faculty.department],
		references: [departments.code],
	}),
	// see note on leaving out studentAdvisors relationship in student-advisors.ts
}));