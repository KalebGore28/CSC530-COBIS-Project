import { sqliteTable, text, int, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { collegeCodes } from "./college_codes";
import { students } from "./students";

export const previousColleges = sqliteTable("previous_colleges", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber),
	college_code: text("college_code").notNull().references(() => collegeCodes.code),
	college_description: text("college_description").notNull(),
	degree: text("degree").notNull(),
	date: int({ mode: "timestamp" }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.college_code] }),
]);

// Define relationships for DBML generation
export const previousCollegesOne = relations(previousColleges, ({ one }) => ({
	college: one(collegeCodes, {
		fields: [previousColleges.college_code],
		references: [collegeCodes.code],
	}),
	student: one(students, {
		fields: [previousColleges.mnumber],
		references: [students.mnumber],
	}),
}));