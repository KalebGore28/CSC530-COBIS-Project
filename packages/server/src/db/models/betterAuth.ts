import { mysqlTable, boolean, int, varchar } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

// All these tables are created by better-auth. Some columns are custom.
// Look here for more info: https://www.better-auth.com/docs/concepts/database#core-schema

import { instructorCourses } from "./instructor-courses";
import { userRoles } from "./user_roles";

export const user = mysqlTable("user", {
	id: varchar("id", { length: 50 }).primaryKey(), // Needed for BetterAuth
	mnumber: varchar("mnumber", { length: 10 }).unique(), // Nullable initially, unique when set
	name: varchar('name', { length: 50 }).notNull(),
	email: varchar('email', { length: 100 }).notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: varchar('image', { length: 255 }).notNull().default(''), // Default to empty string if no image
	createdAt: int('created_at').notNull(),
	updatedAt: int('updated_at').notNull(),
	isEnabled: boolean('is_enabled').notNull().default(false), // For security reasons, we'll default to false
	lastLogin: int('last_login').notNull().default(0),
});

export type User = typeof user.$inferSelect;

// Define relationships for DBML generation
export const usersRelations = relations(user, ({ many }) => ({
	instructor_courses: many(instructorCourses),
	user_roles: many(userRoles),
	// we leave out the faculty relationship as it isn't guaranteed to exist
	// in the faculty table. the user table is automatically created by better-auth,
	// the faculty table is populated by csv import. the admin will have to
	// manually link the two tables together by assigning an mnumber to the user.
}));

export const session = mysqlTable("session", {
	id: varchar("id", { length: 50 }).primaryKey(),
	expiresAt: int('expires_at').notNull(),
	token: varchar('token', { length: 255 }).notNull().unique(),
	createdAt: int('created_at').notNull(),
	updatedAt: int('updated_at').notNull(),
	ipAddress: varchar('ip_address', { length: 45 }),
	userAgent: varchar('user_agent', { length: 255 }),
	userId: varchar('user_id', { length: 50 }).notNull().references(() => user.id, { onDelete: 'cascade' })
});

export type Session = typeof session.$inferSelect;

export const account = mysqlTable("account", {
	id: varchar("id", { length: 50 }).primaryKey(),
	accountId: varchar('account_id', { length: 255 }).notNull(),
	providerId: varchar('provider_id', { length: 255 }).notNull(),
	userId: varchar('user_id', { length: 50 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: varchar('access_token', { length: 255 }),
	refreshToken: varchar('refresh_token', { length: 255 }),
	idToken: varchar('id_token', { length: 255 }),
	accessTokenExpiresAt: int('access_token_expires_at'),
	refreshTokenExpiresAt: int('refresh_token_expires_at'),
	scope: varchar('scope', { length: 255 }),
	createdAt: int('created_at').notNull(),
	updatedAt: int('updated_at').notNull()
});

export type Account = typeof account.$inferSelect;

export const verification = mysqlTable("verification", {
	id: varchar("id", { length: 50 }).primaryKey(),
	identifier: varchar('identifier', { length: 255 }).notNull(),
	value: varchar('value', { length: 255 }).notNull(),
	expiresAt: int('expires_at').notNull(),
	createdAt: int('created_at').notNull(),
	updatedAt: int('updated_at').notNull()
});

export type Verification = typeof verification.$inferSelect;