import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentAcademicInfo } from "./student-academic-info";

export const academicStanding = sqliteTable("academic_standing", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

export type AcademicStanding = typeof academicStanding.$inferSelect;

// Define relationships for DBML generation
export const academicStandingRelations = relations(academicStanding, ({ many }) => ({
	studentAcademicInfo: many(studentAcademicInfo)
}));