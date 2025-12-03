import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import 'dotenv/config';
import * as schema from './schema';

let dbConnection: Promise<MySql2Database<typeof schema>> | null = null;

const createDb = async (): Promise<MySql2Database<typeof schema>> => {

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
	return db;
};

export const getDbConnection = async (): Promise<MySql2Database<typeof schema>> => {
	if (!dbConnection) {
		dbConnection = createDb();
	}
	return dbConnection;
};