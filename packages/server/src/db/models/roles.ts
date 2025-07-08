import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { userRoles } from "./user_roles";

export const roles = mysqlTable("roles", {
	id: int("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
});

export type Role = typeof roles.$inferSelect;

export const roleRelations = relations(roles, ({ many }) => ({
	userRoles: many(userRoles),
}));