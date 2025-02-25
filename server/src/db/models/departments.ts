import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { colleges } from "./colleges";

export const departments = sqliteTable("departments", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
	prefixes: text("prefixes"),
	canvas_id: text("canvas_id"),
	college: text("college").notNull().default("0").references(() => colleges.code),
});

// Define relationships for DBML generation
export const departmentsMany = relations(departments, ({ many, one }) => ({
	colleges: many(colleges), // Colleges have many departments
	college: one(colleges, { // Departments have a college
		fields: [departments.college],
		references: [colleges.code],
	})
}));