import { sqliteTable, text, primaryKey, check } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

import { students } from "./students";
import { nations } from "./nations";

export const studentAddresses = sqliteTable("student_addresses", {
	mnumber: text("mnumber").notNull().references(() => students.mnumber),
	type: text("type").notNull(),
	street1: text("street1").notNull(),
	street2: text("street2"),
	city: text("city").notNull(),
	state: text("state").notNull(),
	zip: text("zip").notNull(),
	nation_code: text("nation_code").notNull().references(() => nations.code),
	phone: text("phone").notNull(),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.type] }),
	check("address_type", sql`${table.type} IN ('HOME', 'LOCAL')`),
]);

// Define relationships for DBML generation
export const studentAddressesOne = relations(studentAddresses, ({ many, one }) => ({
	students: many(students), // Students have many addresses
	nations: many(nations), // Nations have many addresses
	student: one(students, { // Student addresses have a student
		fields: [studentAddresses.mnumber],
		references: [students.mnumber],
	}),
	nation: one(nations, { // Student addresses have a nation
		fields: [studentAddresses.nation_code],
		references: [nations.code],
	}),
}));