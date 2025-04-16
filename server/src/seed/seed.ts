// src/db/seed.ts
import { getDbConnection } from '../db/connection';
import { seedDatabase } from "./csvs";

// Uncomment to test in-memory DB
// process.env.NODE_ENV = 'test';

(async () => {
    // Get DB connection (in-memory for 'test', file-based otherwise)
    const { db, orm } = await getDbConnection();

    // Seed additional data from CSV (assumed to handle other tables)
    await seedDatabase();

    console.log("Database seeded successfully.");
})();