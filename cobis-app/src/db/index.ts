import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import { buildSchema } from 'drizzle-graphql';

import mysql from "mysql2/promise";
import 'dotenv/config';

import * as schema from './schema';
import { GraphQLSchema } from "graphql";

export interface DbConnection {
	db: mysql.Pool;
	orm: MySql2Database<typeof schema>;
	graphql_schema: GraphQLSchema;
}

let _dbConnection: Promise<DbConnection> | null = null;

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

	const { schema: graphql_schema } = buildSchema(db);

	console.log(`✅ Database connected at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
	return { db: poolConnection, orm: db, graphql_schema };
};

export const getDbConnection = async (): Promise<DbConnection> => {
	if (!_dbConnection) {
		_dbConnection = createDb();
	}
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
