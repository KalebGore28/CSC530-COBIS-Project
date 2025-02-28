import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentAcademicInfo } from "./student_academic_info";

export const academicStanding = sqliteTable("academic_standing", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

export const academicStandingRelations = relations(academicStanding, ({ many }) => ({
	studentAcademicInfo: many(studentAcademicInfo)
}));