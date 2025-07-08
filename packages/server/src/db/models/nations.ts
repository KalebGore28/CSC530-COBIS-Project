import { mysqlTable, text } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { studentAddresses } from "./student-addresses";

export const nations = mysqlTable("nations", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

export type Nation = typeof nations.$inferSelect;

export const nationsRelations = relations(nations, ({ many }) => ({
	studentAddresses: many(studentAddresses)
}));