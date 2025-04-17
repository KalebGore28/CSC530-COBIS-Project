import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { userRoles } from "./user_roles";

export const roles = sqliteTable("roles", {
	id: int("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
});

export const roleRelations = relations(roles, ({ many }) => ({
	userRoles: many(userRoles),
}));