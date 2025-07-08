// src/db/schema/course-prefixes.ts
import { mysqlTable, text } from 'drizzle-orm/mysql-core';
import { departments } from "./departments";
import { colleges } from "./colleges";

export const coursePrefixes = mysqlTable("course_prefixes", {
	prefix: text("prefix").primaryKey(),         // e.g. "ACC"
	department: text("department").notNull().references(() => departments.code),
	college: text("college").notNull().references(() => colleges.code),
});

export type CoursePrefix = typeof coursePrefixes.$inferSelect;
