import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { departments } from "./departments";
import { colleges } from "./colleges";

// Originally intended for all faculty, but now only for instructors
// since the table is only populated with faculty teaching courses
// from the reg_cuba_courses_during_term.csv file.
export const faculty = sqliteTable("faculty", {
	mnumber: text("mnumber").primaryKey(),
	first_name: text("first_name").notNull(),
	last_name: text("last_name").notNull(),
	college: text('college').references(() => colleges.code).default("0"),
	department: text('department').references(() => departments.code).default("0000"),
});

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