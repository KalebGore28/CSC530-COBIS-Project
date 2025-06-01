import { sqliteTable, text, real, int, primaryKey } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

import { instructorCourses } from "./instructor-courses";
import { studentCourses } from "./student-courses";
import { departments } from "./departments";
import { colleges } from "./colleges";

export const courses = sqliteTable("courses", {
	subject: text("subject").notNull(),
	number: int("number").notNull(),
	suffix: text("suffix").notNull().default(""),
	title: text("title").notNull(),
	hours: int("hours").notNull(),
	fee: real("fee").notNull().default(0),
	web_fee: real("web_fee").notNull().default(0),
	last_updated: text("last_updated").notNull().default(sql`CURRENT_TIMESTAMP`),
	department: text("department").default("0000").references(() => departments.code),
	college: text("college").default("0").references(() => colleges.code),
}, (table) => [
	primaryKey({ columns: [table.subject, table.number, table.suffix] }),
]);

export type Course = typeof courses.$inferSelect;

export const coursesRelations = relations(courses, ({ many }) => ({
	instructor_courses: many(instructorCourses),
	student_courses: many(studentCourses),
}));