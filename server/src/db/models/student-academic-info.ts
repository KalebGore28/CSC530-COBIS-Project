import { sqliteTable, text, int, real, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { students } from "./students";
import { academicStanding } from "./academic-standing";
import { terms } from "./terms";
import { admitCodes } from "./admit-codes";

export const studentAcademicInfo = sqliteTable("student_academic_info", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber),
	term: text("term").notNull().references(() => terms.code),
	year: int("year").notNull(),
	admit_term: text("admit_term").notNull().references(() => terms.code),
	admit_year: int("admit_year").notNull(),
	admit_code: text("admit_code").notNull().references(() => admitCodes.code),
	academic_standing: text("academic_standing").notNull().references(() => academicStanding.code),
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

// Define relationships for DBML generation
export const studentAcademicInfoRelations = relations(studentAcademicInfo, ({ one }) => ({
	student: one(students, { // Student academic info has a student
		fields: [studentAcademicInfo.mnumber],
		references: [students.mnumber],
	}),
	admitTerm: one(terms, { // Student academic info has an admit term
		fields: [studentAcademicInfo.admit_term],
		references: [terms.code],
	}),
	admitCode: one(admitCodes, { // Student academic info has an admit code
		fields: [studentAcademicInfo.admit_code],
		references: [admitCodes.code],
	}),
	standing: one(academicStanding, { // Student academic info has an academic standing
		fields: [studentAcademicInfo.academic_standing],
		references: [academicStanding.code],
	}),
}));