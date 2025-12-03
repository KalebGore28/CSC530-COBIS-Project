import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import 'dotenv/config';

let dbConnection: Promise<MySql2Database> | null = null;

const createDb = async (): Promise<MySql2Database> => {
	const poolConnection = mysql.createPool({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	});

	if (!poolConnection) {
		throw new Error('❌ Failed to create database connection. Please check your environment variables.');
	}

	const db = drizzle({ client: poolConnection });

	console.log(`✅ Database connected at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
	return db;
};

export const getDbConnection = async (): Promise<MySql2Database> => {
	if (!dbConnection) {
		dbConnection = createDb();
	}
	return dbConnection;
};