import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { departments } from "./departments";
import { colleges } from "./colleges";

export const faculty = sqliteTable("faculty", {
	mnumber: text("mnumber").primaryKey(),
	first_name: text("first_name").notNull(),
	last_name: text("last_name").notNull(),
	college: text('college').references(() => colleges.code),
	department: text('department').references(() => departments.code),
});