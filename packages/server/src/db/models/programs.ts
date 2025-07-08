import { mysqlTable, boolean, varchar, datetime } from 'drizzle-orm/mysql-core';
import { sql, relations } from "drizzle-orm";

import { colleges } from "./colleges";
import { departments } from "./departments";
import { studentPrograms } from "./student-programs";

export const programs = mysqlTable("programs", {
	code: varchar("code", { length: 10 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
	cip_code: varchar("cip_code", { length: 255 }),
	is_major: boolean("is_major").notNull().default(false),
	is_minor: boolean("is_minor").notNull().default(false),
	has_concentration: boolean("has_concentration").notNull().default(false),
	is_discontinued: boolean("is_discontinued").notNull().default(false),
	is_aacsb: boolean("is_aacsb").notNull().default(false),
	department: varchar("department", { length: 50 }).notNull().references(() => departments.code),
	college: varchar("college", { length: 50 }).notNull().references(() => colleges.code),
	added_on: datetime().notNull().default(sql`NOW()`),
});

export type Program = typeof programs.$inferSelect;

// Define relationships for DBML generation
export const programsOne = relations(programs, ({ one, many }) => ({
	studentPrograms: many(studentPrograms),
	college: one(colleges, {
		fields: [programs.college],
		references: [colleges.code],
	}),
	department: one(departments, {
		fields: [programs.department],
		references: [departments.code],
	}),
}));