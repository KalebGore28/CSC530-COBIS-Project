import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'
import type { MySql2Database } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../../src/db/schema.ts'
import { reset } from 'drizzle-seed'

let db: MySql2Database | null = null
let poolConnection: mysql.Pool | null = null

export function getDb() {
    if (!db) {
        poolConnection = mysql.createPool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        })
        db = drizzle({ client: poolConnection })
    }
    return db
}

export async function resetDb() {
    const database = getDb()
    await reset(database, schema)
}

export async function closeDb() {
    if (poolConnection) {
        await poolConnection.end()
        poolConnection = null
        db = null
    }
}
