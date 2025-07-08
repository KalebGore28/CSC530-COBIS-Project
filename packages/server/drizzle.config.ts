import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './drizzle',
	schema: './src/db/schema.ts',
	dialect: 'mysql',
	dbCredentials: {
		url: process.env.DB_URL as string,
	},
	casing: 'snake_case',
	verbose: true,
	strict: true,
});