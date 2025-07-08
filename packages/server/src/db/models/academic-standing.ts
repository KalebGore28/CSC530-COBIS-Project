import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { studentAcademicInfo } from "./student-academic-info";

export const academicStanding = mysqlTable("academic_standing", {
	code: varchar("code", { length: 50 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export type AcademicStanding = typeof academicStanding.$inferSelect;

// Define relationships for DBML generation
export const academicStandingRelations = relations(academicStanding, ({ many }) => ({
	studentAcademicInfo: many(studentAcademicInfo)
}));