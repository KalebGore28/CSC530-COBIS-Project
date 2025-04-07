import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { departments } from "./departments";
import { programs } from "./programs";
import { studentPrograms } from "./student-programs";


export const colleges = sqliteTable("colleges", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

export const collegesRelations = relations(colleges, ({ one, many }) => ({
	departments: many(departments),
	programs: many(programs),
	studentPrograms: many(studentPrograms),
}));