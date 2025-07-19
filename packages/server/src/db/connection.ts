// src/db/connection.ts
import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as tables from './schema';

export interface DbConnection {
	db: mysql.Pool;
	orm: MySql2Database<typeof tables>;
}

let _dbConnection: Promise<DbConnection> | null = null;

export const createDb = async (): Promise<DbConnection> => {

	const poolConnection = mysql.createPool({
		host: "localhost",
		port: 3306,
		user: "root",
		password: "my-secret",
		database: "mydb"
	});
	const db = drizzle(poolConnection, { schema: tables, mode: 'default' });

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
