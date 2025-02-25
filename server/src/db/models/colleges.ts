import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { departments } from "./departments";
import { programs } from "./programs";
import { studentPrograms } from "./student_programs";
import { subjectPrefixes } from "./subject_prefixes";

export const colleges = sqliteTable("colleges", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

export const collegesRelations = relations(colleges, ({ many }) => ({
	departments: many(departments),
	programs: many(programs),
	studentPrograms: many(studentPrograms),
	subjectPrefixes: many(subjectPrefixes),
}));