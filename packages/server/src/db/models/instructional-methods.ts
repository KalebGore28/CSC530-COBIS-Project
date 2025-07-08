import { mysqlTable, text } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { studentCourses } from "./student-courses";

export const instructionalMethods = mysqlTable("instructional_methods", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

export type InstructionalMethod = typeof instructionalMethods.$inferSelect;

// Define relationships for DBML generation
export const instructionalMethodsRelations = relations(instructionalMethods, ({ many }) => ({
	studentCourses: many(studentCourses),
}));