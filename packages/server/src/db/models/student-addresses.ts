import { mysqlTable, text, primaryKey, check } from 'drizzle-orm/mysql-core';
import { sql, relations } from "drizzle-orm";

import { students } from "./students";
import { nations } from "./nations";

export const studentAddresses = mysqlTable("student_addresses", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber, { onDelete: "cascade"}),
	type: text("type").notNull(),
	street1: text("street1").notNull(),
	street2: text("street2"),
	city: text("city").notNull(),
	state: text("state").notNull(),
	zip: text("zip").notNull(),
	nation: text("nation").notNull().references(() => nations.code),
	phone: text("phone").notNull(),
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