import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { colleges } from "./colleges";
import { departments } from "./departments";

export const subjectPrefixes = sqliteTable("subject_prefixes", {
	college: text("college").notNull().references(() => colleges.code),
	department: text("department").notNull().references(() => departments.code),
	prefix: text("prefix").notNull(),
}, (table) => [
	primaryKey({ columns: [table.college, table.department, table.prefix] }),
]);

// Define relationships for DBML generation
export const subjectPrefixesMany = relations(subjectPrefixes, ({ one }) => ({
	college: one(colleges, { // Subject prefixes have a college
		fields: [subjectPrefixes.college],
		references: [colleges.code],
	}),
	department: one(departments, { // Subject prefixes have a department
		fields: [subjectPrefixes.department],
		references: [departments.code],
	}),
}));