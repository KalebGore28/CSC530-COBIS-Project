import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import 'dotenv/config';

console.log(process.env.DB_HOST)

import * as tables from './schema';

export interface DbConnection {
	db: mysql.Pool;
	orm: MySql2Database<typeof tables>;
}

let _dbConnection: Promise<DbConnection> | null = null;

export const createDb = async (): Promise<DbConnection> => {

	const poolConnection = mysql.createPool({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	});

	const db = drizzle(poolConnection, { schema: tables, mode: 'default' });
	if (!poolConnection) {
		throw new Error('❌ Failed to create database connection. Check DB_URL in .env');
	}

	console.log(`✅ Database connected at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
	return { orm: db, db: poolConnection };
};

export const getDbConnection = async (): Promise<DbConnection> => {
	if (!_dbConnection) {
		_dbConnection = createDb();
	}
	return _dbConnection;
};

export const resetDbConnection = async (): Promise<DbConnection> => {
	_dbConnection = createDb();

	return _dbConnection;
};

export const seedDb = async (
	dbConn: DbConnection,
	seeders: Array<(orm: DbConnection['orm']) => Promise<void>>
): Promise<void> => {
	for (const seeder of seeders) {
		await seeder(dbConn.orm);
	}
};
