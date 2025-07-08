import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { departments } from "./departments";
import { programs } from "./programs";
import { faculty } from "./faculty";

export const colleges = mysqlTable("colleges", {
	code: varchar("code", { length: 50 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export type College = typeof colleges.$inferSelect;

// Define relationships for DBML generation
export const collegesRelations = relations(colleges, ({ many }) => ({
	departments: many(departments),
	programs: many(programs),
	faculty: many(faculty),
}));