import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentCourses } from "./student-courses";

export const instructionalMethods = sqliteTable("instructional_methods", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

// Define relationships for DBML generation
export const instructionalMethodsRelations = relations(instructionalMethods, ({ many }) => ({
	studentCourses: many(studentCourses),
}));