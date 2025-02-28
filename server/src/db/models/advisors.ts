import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentAdvisors } from "./student_advisors";

export const advisors = sqliteTable("advisors", {
	id: text("id").primaryKey(),
	first_name: text("first_name").notNull(),
	last_name: text("last_name").notNull(),
	middle_name: text("middle_name").notNull(),
	suffix: text("suffix").notNull(),
});

export const advisorsRelations = relations(advisors, ({ many }) => ({
	studentAdvisors: many(studentAdvisors),
}));