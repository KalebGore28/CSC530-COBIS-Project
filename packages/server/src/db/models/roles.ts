import { mysqlTable, text, int } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

import { userRoles } from "./user_roles";

export const roles = mysqlTable("roles", {
	id: int("id").primaryKey(),
	name: text("name").notNull(),
});

export type Role = typeof roles.$inferSelect;

export const roleRelations = relations(roles, ({ many }) => ({
	userRoles: many(userRoles),
}));