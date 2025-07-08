import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { studentAcademicInfo } from "./student-academic-info";

export const admitCodes = mysqlTable("admit_codes", {
	code: varchar("code", { length: 50 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export type AdmitCode = typeof admitCodes.$inferSelect;

// Define relationships for DBML generation
export const admitCodesRelations = relations(admitCodes, ({ many }) => ({
	studentAcademicInfo: many(studentAcademicInfo)
}));