import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
    id: text().primaryKey(),
    email: text().notNull().unique(),
    display_name: text().notNull(),
    is_active: int({ mode: 'boolean' }).notNull().default(false), // For security reasons, we'll default to false
    last_login: text().notNull().default(sql`CURRENT_TIMESTAMP`),
    created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});