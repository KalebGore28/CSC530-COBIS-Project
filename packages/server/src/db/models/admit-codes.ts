import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentAcademicInfo } from "./student-academic-info";

export const admitCodes = sqliteTable("admit_codes", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

// Define relationships for DBML generation
export const admitCodesRelations = relations(admitCodes, ({ many }) => ({
	studentAcademicInfo: many(studentAcademicInfo)
}));