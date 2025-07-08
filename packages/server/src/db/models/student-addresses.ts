import { mysqlTable, primaryKey, check, varchar } from 'drizzle-orm/mysql-core';
import { sql, relations } from "drizzle-orm";

import { students } from "./students";
import { nations } from "./nations";

export const studentAddresses = mysqlTable("student_addresses", {
	mnumber: varchar("mnumber", { length: 10 }).notNull().references(() => students.mnumber, { onDelete: "cascade"}),
	type: varchar("type", { length: 50 }).notNull(),
	street1: varchar("street1", { length: 100 }).notNull(),
	street2: varchar("street2", { length: 100 }),
	city: varchar("city", { length: 50 }).notNull(),
	state: varchar("state", { length: 50 }).notNull(),
	zip: varchar("zip", { length: 10 }).notNull(),
	nation: varchar("nation", { length: 50 }).notNull().references(() => nations.code),
	phone: varchar("phone", { length: 15 }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.type] }),
	check("address_type", sql`${table.type} IN ('HOME', 'LOCAL')`),
]);

export type StudentAddress = typeof studentAddresses.$inferSelect;

// Define relationships for DBML generation
export const studentAddressRelations = relations(studentAddresses, ({ one }) => ({
	student: one(students, { // Student addresses have a student
		fields: [studentAddresses.mnumber],
		references: [students.mnumber],
	}),
	nation: one(nations, { // Student addresses have a nation
		fields: [studentAddresses.nation],
		references: [nations.code],
	}),
}));