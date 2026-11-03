import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import type { Pool } from "mysql2/promise";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { relations } from "@/db/relations";
import "dotenv/config";

// The dev server re-runs this module on reload, so the pool lives on globalThis to avoid opening a new one each time
const globalForDb = globalThis as typeof globalThis & { dbPool?: Pool };

let dbConnection: MySql2Database | null = null;

export function getDb() {
  if (!dbConnection) {
    globalForDb.dbPool ??= mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    dbConnection = drizzle({ client: globalForDb.dbPool, relations });

    console.log(
      `✅ Database connected at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    );
  }
  return dbConnection;
}
