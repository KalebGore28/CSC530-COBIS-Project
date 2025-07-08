import { mysqlTable, real, int, primaryKey, varchar, datetime } from 'drizzle-orm/mysql-core';
import { sql, relations } from "drizzle-orm";

import { instructorCourses } from "./instructor-courses";
import { studentCourses } from "./student-courses";
import { departments } from "./departments";
import { colleges } from "./colleges";

export const courses = mysqlTable("courses", {
	subject: varchar("subject", { length: 50 }).notNull(), // e.g. "ACC"
	number: int("number").notNull(),
	suffix: varchar("suffix", { length: 50 }).notNull().default(""),
	title: varchar("title", { length: 255 }).notNull(),
	hours: int("hours").notNull(),
	fee: real("fee").notNull().default(0),
	web_fee: real("web_fee").notNull().default(0),
	last_updated: datetime("last_updated").notNull().default(sql`NOW()`),
	department: varchar("department", { length: 50 }).default("0000").references(() => departments.code),
	college: varchar("college", { length: 50 }).default("0").references(() => colleges.code),
}, (table) => [
	primaryKey({ columns: [table.subject, table.number, table.suffix] }),
]);

export type Course = typeof courses.$inferSelect;

export const coursesRelations = relations(courses, ({ many }) => ({
	instructor_courses: many(instructorCourses),
	student_courses: many(studentCourses),
}));