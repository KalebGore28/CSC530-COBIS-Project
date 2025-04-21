import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { departments } from "./departments";
import { colleges } from "./colleges";

// Originally intended for all faculty, but now only for instructors
export const faculty = sqliteTable("faculty", {
	mnumber: text("mnumber").primaryKey(),
	first_name: text("first_name").notNull(),
	last_name: text("last_name").notNull(),
	college: text('college').references(() => colleges.code).default("0"),
	department: text('department').references(() => departments.code).default("0000"),
});