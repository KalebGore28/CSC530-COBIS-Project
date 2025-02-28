import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { previousColleges } from "./previous_colleges";

export const collegeCodes = sqliteTable("college_codes", {
	code: text("code").primaryKey(),
	description: text("description").notNull(),
});

export const collegeCodesRelations = relations(collegeCodes, ({ many }) => ({
	previousColleges: many(previousColleges),
}));