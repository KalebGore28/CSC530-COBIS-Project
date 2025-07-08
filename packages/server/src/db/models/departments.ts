import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { colleges } from "./colleges";
import { programs } from "./programs";
import { faculty } from "./faculty";

export const departments = mysqlTable("departments", {
	code: varchar("code", { length: 50 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
	college: varchar("college", { length: 50 }).notNull().default("0").references(() => colleges.code),
});

export type Department = typeof departments.$inferSelect;

// Define relationships for DBML generation
export const departmentsRelations = relations(departments, ({ one, many }) => ({
	programs: many(programs),
	faculty: many(faculty),
	college: one(colleges, {
		fields: [departments.college],
		references: [colleges.code],
	}),
}));