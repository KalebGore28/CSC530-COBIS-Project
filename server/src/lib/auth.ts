import { betterAuth } from "better-auth"
import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema } from "../db/schema";
import Database from "better-sqlite3";
import { config } from "../utils/config";

const db = new Database(config.db.url);
const orm = drizzle(db, { schema: { ...schema.betterAuth } });

export const auth = betterAuth({
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