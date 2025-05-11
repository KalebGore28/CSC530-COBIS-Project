import { betterAuth } from "better-auth"
import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { verification, session, user, account } from "../db/schema";
import Database from "better-sqlite3";
import { config } from "../utils/config";

const db = new Database(config.db.url);
const orm = drizzle(db, {
	schema: { // This part of the schema is passed in for better-auth
		verification,
		session,
		user,
		account
	}
});

/**
 * The better-auth instance.
 */
export const auth = betterAuth({
	session: {
		// For more info: https://www.better-auth.com/docs/guides/optimizing-for-performance
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // Cache duration in seconds
		},
		// For more info: https://www.better-auth.com/docs/concepts/session-management
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
	},
	database: drizzleAdapter(orm, {
		provider: "sqlite",
	}),
	baseURL: config.betterAuthUrl,
	trustedOrigins: [config.frontend_origin],
	socialProviders: {
		// This app was only designed to work with Google OAuth even though better-auth supports more.
		// It is not recommended to use another provider, otherwise domain restrictions will not work.
		// Domain restrictions are enforced in the restrictGoogleCallback middleware.
		google: {
			clientId: config.oauth.google.clientId,
			clientSecret: config.oauth.google.clientSecret,
		}
	},
	user: {
		
	}
});