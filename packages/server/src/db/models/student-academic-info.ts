import { mysqlTable, int, real, primaryKey, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { students } from "./students";
import { academicStanding } from "./academic-standing";
import { terms } from "./terms";
import { admitCodes } from "./admit-codes";

export const studentAcademicInfo = mysqlTable("student_academic_info", {
	mnumber: varchar("mnumber", { length: 10 }).notNull().references(() => students.mnumber, { onDelete: "cascade" }),
	term: varchar("term", { length: 50 }).notNull().references(() => terms.code),
	year: int("year").notNull(),
	admit_term: varchar("admit_term", { length: 50 }).notNull().references(() => terms.code),
	admit_year: int("admit_year").notNull(),
	admit_code: varchar("admit_code", { length: 50 }).notNull().references(() => admitCodes.code),
	academic_standing: varchar("academic_standing", { length: 50 }).notNull().references(() => academicStanding.code),
	msu_attempted_hours: real("msu_attempted_hours").notNull(),
	msu_earned_hours: real("msu_earned_hours").notNull(),
	msu_quality_points: real("msu_quality_points").notNull(),
	msu_gpa: real("msu_gpa").notNull(),
	overall_attempted_hours: real("overall_attempted_hours").notNull(),
	overall_earned_hours: real("overall_earned_hours").notNull(),
	overall_quality_points: real("overall_quality_points").notNull(),
	overall_gpa: real("overall_gpa").notNull(),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.term, table.year] }),
]);

export type StudentAcademicInfo = typeof studentAcademicInfo.$inferSelect;

// Define relationships for DBML generation
export const studentAcademicInfoRelations = relations(studentAcademicInfo, ({ one }) => ({
	student: one(students, {
		fields: [studentAcademicInfo.mnumber],
		references: [students.mnumber],
	}),
	admitTerm: one(terms, {
		fields: [studentAcademicInfo.admit_term],
		references: [terms.code],
	}),
	admitCode: one(admitCodes, {
		fields: [studentAcademicInfo.admit_code],
		references: [admitCodes.code],
	}),
	academicStanding: one(academicStanding, {
		fields: [studentAcademicInfo.academic_standing],
		references: [academicStanding.code],
	}),
}));