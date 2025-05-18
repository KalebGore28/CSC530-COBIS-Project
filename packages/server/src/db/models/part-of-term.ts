import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentCourses } from "./student-courses";

export const partOfTerm = sqliteTable("part_of_term", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

export type PartOfTerm = typeof partOfTerm.$inferSelect;

export const partOfTermRelations = relations(partOfTerm, ({ many }) => ({
	studentCourses: many(studentCourses),
}));