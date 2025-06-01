import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentAcademicInfo } from "./student-academic-info";

export const admitCodes = sqliteTable("admit_codes", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

export type AdmitCode = typeof admitCodes.$inferSelect;

// Define relationships for DBML generation
export const admitCodesRelations = relations(admitCodes, ({ many }) => ({
	studentAcademicInfo: many(studentAcademicInfo)
}));