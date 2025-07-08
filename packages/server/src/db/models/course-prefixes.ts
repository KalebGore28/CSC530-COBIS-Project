// src/db/schema/course-prefixes.ts
import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { departments } from "./departments";
import { colleges } from "./colleges";

export const coursePrefixes = mysqlTable("course_prefixes", {
	prefix: varchar("prefix", { length: 50 }).primaryKey(),         // e.g. "ACC"
	department: varchar("department", { length: 50 }).notNull().references(() => departments.code),
	college: varchar("college", { length: 50 }).notNull().references(() => colleges.code),
});

export type CoursePrefix = typeof coursePrefixes.$inferSelect;
