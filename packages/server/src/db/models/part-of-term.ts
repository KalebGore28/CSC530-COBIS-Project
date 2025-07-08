import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { studentCourses } from "./student-courses";

export const partOfTerm = mysqlTable("part_of_term", {
	code: varchar("code", { length: 50 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export type PartOfTerm = typeof partOfTerm.$inferSelect;

export const partOfTermRelations = relations(partOfTerm, ({ many }) => ({
	studentCourses: many(studentCourses),
}));