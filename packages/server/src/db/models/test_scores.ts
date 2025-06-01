import { sqliteTable, text, real, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { students } from "./students";

export const testScores = sqliteTable("test_scores", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber, { onDelete: "cascade" }),
	code: text("code").notNull(),
	description: text("description").notNull(),
	score: real("score").notNull(),
	date: text("date").notNull(),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.code, table.date] }),
]);

export type TestScores = typeof testScores.$inferSelect;

// Define relationships for DBML generation
export const testScoresOne = relations(testScores, ({ one }) => ({
	student: one(students, { // Test scores have a student
		fields: [testScores.mnumber],
		references: [students.mnumber],
	}),
}));