import { mysqlTable, text, boolean, int } from 'drizzle-orm/mysql-core';
import { sql, relations } from "drizzle-orm";

// All these tables are created by better-auth. Some columns are custom.
// Look here for more info: https://www.better-auth.com/docs/concepts/database#core-schema

import { instructorCourses } from "./instructor-courses";
import { userRoles } from "./user_roles";

export const user = mysqlTable("user", {
	id: text("id").primaryKey(), // Needed for BetterAuth
	mnumber: text("mnumber").unique(), // Nullable initially, unique when set
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: int('created_at').notNull(),
	updatedAt: int('updated_at').notNull(),
	isEnabled: boolean('is_enabled').notNull().default(false), // For security reasons, we'll default to false
	lastLogin: int('last_login').notNull().default(sql`(strftime('%s','now'))`),
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
	id: text("id").primaryKey(),
	expiresAt: int('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: int('created_at').notNull(),
	updatedAt: int('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export type Session = typeof session.$inferSelect;

export const account = mysqlTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: int('access_token_expires_at'),
	refreshTokenExpiresAt: int('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: int('created_at').notNull(),
	updatedAt: int('updated_at').notNull()
});

export type Account = typeof account.$inferSelect;

export const verification = mysqlTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: int('expires_at').notNull(),
	createdAt: int('created_at').notNull(),
	updatedAt: int('updated_at').notNull()
});

export type Verification = typeof verification.$inferSelect;