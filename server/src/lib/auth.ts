import { betterAuth } from "better-auth"
import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema } from "../db/schema";
import Database from "better-sqlite3";
import { config } from "../utils/config";

const db = new Database(config.db.url);
const orm = drizzle(db, { schema: { ...schema } });

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
	trustedOrigins: [config.frontend_origin],
	socialProviders: {
		google: {
			clientId: config.oauth.google.clientId,
			clientSecret: config.oauth.google.clientSecret,
		}
	},
});