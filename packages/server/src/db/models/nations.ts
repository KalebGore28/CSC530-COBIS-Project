import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { studentAddresses } from "./student-addresses";

export const nations = mysqlTable("nations", {
	code: varchar("code", { length: 50 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export type Nation = typeof nations.$inferSelect;

export const nationsRelations = relations(nations, ({ many }) => ({
	studentAddresses: many(studentAddresses)
}));