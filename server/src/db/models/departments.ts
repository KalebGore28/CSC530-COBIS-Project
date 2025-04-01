import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { colleges } from "./colleges";
import { programs } from "./programs";
import { studentPrograms } from "./student-programs";
import { subjectPrefixes } from "./subject_prefixes";
import { user } from "./betterAuth";

export const departments = sqliteTable("departments", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
	prefixes: text("prefixes"),
	canvas_id: text("canvas_id"),
	college: text("college").notNull().default("0").references(() => colleges.code),
});

// Define relationships for DBML generation
export const departmentsRelations = relations(departments, ({ one, many }) => ({
	programs: many(programs),
	studentPrograms: many(studentPrograms),
	subjectPrefixes: many(subjectPrefixes),
	college: one(colleges, {
		fields: [departments.college],
		references: [colleges.code],
	}),
	users: one(user, {
		fields: [departments.code],
		references: [user.department],
	}),
}));