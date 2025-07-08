import { mysqlTable, text } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { departments } from "./departments";
import { programs } from "./programs";
import { faculty } from "./faculty";

export const colleges = mysqlTable("colleges", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

export type College = typeof colleges.$inferSelect;

// Define relationships for DBML generation
export const collegesRelations = relations(colleges, ({ many }) => ({
	departments: many(departments),
	programs: many(programs),
	faculty: many(faculty),
}));