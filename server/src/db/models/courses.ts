import { sqliteTable, text, real, int, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const courses = sqliteTable("courses", {
	subject: text("subject").notNull(),
	number: int("number").notNull(),
	suffix: text("suffix").notNull().default(""),
	title: text("title").notNull(),
	hours: int("hours").notNull(),
	fee: real("fee").notNull().default(0),
	web_fee: real("web_fee").notNull().default(0),
	last_updated: text("last_updated").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	primaryKey({ columns: [table.subject, table.number, table.suffix] }),
]);