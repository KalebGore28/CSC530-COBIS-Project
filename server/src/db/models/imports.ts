// src/db/models/imports.ts

import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

import { users } from "./users";

export const imports = sqliteTable("imports", {
	id: int().primaryKey({ autoIncrement: true }),
	entity_type: text().notNull(),
	file_name: text().notNull(),
	total_records: int().notNull(),
	error_details: text().notNull(),
	import_status: text().notNull(),
	imported_by: int().notNull().references(() => users.id),
	import_date: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Define relationships for DBML generation
export const importsOne = relations(imports, ({ one }) => ({
	importedBy: one(users, {
		fields: [imports.imported_by],
		references: [users.id],
	}),
}))