import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { reset } from "drizzle-seed";
import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "@/db/schema.ts";
import { relations } from "@/db/relations.ts";

let db: MySql2Database<typeof schema | typeof relations> | null = null;
let poolConnection: mysql.Pool | null = null;

export function getDb() {
  if (!db) {
    console.log("Creating new database connection...");
    poolConnection = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    db = drizzle({ client: poolConnection, relations });
  }
  return db;
}

export async function resetDb() {
  const database = getDb();

  // This removes tables that are not allowed to be reset
  // This is done to maintain the auth tables for convenience while testing
  const allowableResets = {
    ...schema,
    user: undefined,
    session: undefined,
    account: undefined,
    verification: undefined,
    userRoles: undefined,
  };
  await reset(database, allowableResets);
}

export async function closeDb() {
  if (poolConnection) {
    await poolConnection.end();
    poolConnection = null;
    db = null;
  }
}
