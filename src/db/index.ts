import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import 'dotenv/config';
import * as schema from './schema';

export interface DbConnection {
	db: mysql.Pool;
	orm: MySql2Database<typeof schema>;
}

const globalForDb = globalThis as unknown as {
	_dbConnection?: Promise<DbConnection>;
};

const createDb = async (): Promise<DbConnection> => {

	const poolConnection = mysql.createPool({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	});

	const db = drizzle(poolConnection, { schema: schema, mode: 'default' });
	if (!poolConnection) {
		throw new Error('❌ Failed to create database connection. Please check your environment variables.');
	}

	console.log(`✅ Database connected at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
	return { db: poolConnection, orm: db };
};

export const getDbConnection = async (): Promise<DbConnection> => {
	if (!globalForDb._dbConnection) {
		globalForDb._dbConnection = createDb();
	}
	return globalForDb._dbConnection;
};

export const seedDb = async (
	dbConn: DbConnection,
	seeders: Array<(orm: DbConnection['orm']) => Promise<void>>
): Promise<void> => {
	for (const seeder of seeders) {
		await seeder(dbConn.orm);
	}
};
