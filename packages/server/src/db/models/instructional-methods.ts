import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { studentCourses } from "./student-courses";

export const instructionalMethods = mysqlTable("instructional_methods", {
	code: varchar("code", { length: 50 }).primaryKey(), // e.g. "LEC"
	description: varchar("description", { length: 255 }).notNull(),
});

export type InstructionalMethod = typeof instructionalMethods.$inferSelect;

// Define relationships for DBML generation
export const instructionalMethodsRelations = relations(instructionalMethods, ({ many }) => ({
	studentCourses: many(studentCourses),
}));