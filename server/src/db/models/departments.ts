import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { colleges } from "./colleges";

export const departments = sqliteTable("departments", {
	code: text().primaryKey(),
	description: text().notNull(),
	prefixes: text().notNull(),
	canvas_id: int().notNull(),
	college: text().notNull().default("UNASSIGNED").references(() => colleges.code),
});

// Define relationships for DBML generation
export const departmentsMany = relations(departments, ({ many, one }) => ({
	colleges: many(colleges), // Colleges have many departments
	college: one(colleges, { // Departments have a college
		fields: [departments.college],
		references: [colleges.code],
	})
}));