import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import type { MySql2Database } from 'drizzle-orm/mysql2'
import type * as schema from '@/db/schema.ts'
import { relations } from '@/db/relations'
import 'dotenv/config'

let dbConnection: MySql2Database<typeof schema | typeof relations> | null = null

export function getDb() {
    if (!dbConnection) {
        const poolConnection = mysql.createPool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        })
        dbConnection = drizzle({ client: poolConnection, relations })

        console.log(
            `✅ Database connected at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
        )
    }
    return dbConnection
}
