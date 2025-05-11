// src/db/schema/course-prefixes.ts
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { departments } from "./departments";
import { colleges } from "./colleges";

export const coursePrefixes = sqliteTable("course_prefixes", {
	prefix: text("prefix").primaryKey(),         // e.g. "ACC"
	department: text("department").notNull().references(() => departments.code),
	college: text("college").notNull().references(() => colleges.code),
});
