import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { colleges } from "./colleges";
import { programs } from "./programs";
import { studentPrograms } from "./student-programs";

export const departments = sqliteTable("departments", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
	college: text("college").notNull().default("0").references(() => colleges.code),
});

// Define relationships for DBML generation
export const departmentsRelations = relations(departments, ({ one, many }) => ({
	programs: many(programs),
	studentPrograms: many(studentPrograms),
	college: one(colleges, {
		fields: [departments.college],
		references: [colleges.code],
	}),
}));