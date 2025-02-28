// src/db/models/imports.ts

import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

import { users } from "./users";

export const imports = sqliteTable("imports", {
	id: int("id").primaryKey({ autoIncrement: true }),
	entity_type: text("entity_type").notNull(),
	file_name: text("file_name").notNull(),
	total_records: int("total_records").notNull(),
	error_details: text("error_details").notNull(),
	import_status: text("import_status").notNull(),
	imported_by: text("imported_by").notNull().references(() => users.id),
	import_date: text("import_date").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Define relationships for DBML generation
export const importRelations = relations(imports, ({ one }) => ({
	importedBy: one(users, {
		fields: [imports.imported_by],
		references: [users.id],
	}),
}))