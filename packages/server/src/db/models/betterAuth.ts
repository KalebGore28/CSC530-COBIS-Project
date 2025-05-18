import { sqliteTable, text, integer, } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

// All these tables are created by better-auth. Some columns are custom.
// Look here for more info: https://www.better-auth.com/docs/concepts/database#core-schema

import { instructorCourses } from "./instructor-courses";
import { userRoles } from "./user_roles";

export const user = sqliteTable("user", {
	id: text("id").primaryKey(), // Needed for BetterAuth
	mnumber: text("mnumber").unique(), // Nullable initially, unique when set
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(false), // For security reasons, we'll default to false
	lastLogin: integer('last_login', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
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

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export type Session = typeof session.$inferSelect;

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Account = typeof account.$inferSelect;

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
});

export type Verification = typeof verification.$inferSelect;