import { sqliteTable, text, int, real, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { students } from "./students";

export const testScores = sqliteTable("test_scores", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber),
	code: text("code").notNull(),
	description: text("description").notNull(),
	score: real("score").notNull(),
	date: int({ mode: "timestamp" }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.code, table.date] }),
]);

// Define relationships for DBML generation
export const testScoresOne = relations(testScores, ({ many, one }) => ({
	students: many(students), // Students have many test scores
	student: one(students, { // Test scores have a student
		fields: [testScores.mnumber],
		references: [students.mnumber],
	}),
}));