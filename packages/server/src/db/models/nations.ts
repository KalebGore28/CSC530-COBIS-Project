import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { studentAddresses } from "./student-addresses";

export const nations = sqliteTable("nations", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

export const nationsRelations = relations(nations, ({ many }) => ({
	studentAddresses: many(studentAddresses)
}));