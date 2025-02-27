// src/test/myApi.test.ts
// @ts-nocheck
import { describe, beforeEach, test, expect } from 'vitest';
import { createTestDatabase } from '../setupTestDB';

describe('My API Tests', () => {
  let db: ReturnType<typeof createTestDatabase> extends Promise<infer T> ? T['db'] : any;
  let orm: ReturnType<typeof createTestDatabase> extends Promise<infer T> ? T['orm'] : any;

  beforeEach(async () => {
    // Create and prepare a new in-memory database for each test
    const testDb = await createTestDatabase();
    db = testDb.db;
    orm = testDb.orm;
  });

  test('should have the expected tables in the schema', () => {
    // Query the SQLite system table to list all tables
    const schemaInfo = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all();

    const tableNames = schemaInfo.map((row: { name: string }) => row.name);
    expect(tableNames).toContain('users');
    // Add more assertions for other tables if needed
  });

  test('should be able to insert and retrieve a user', () => {
    // Insert a user using raw SQL (you can also use your Drizzle ORM insert if you prefer)
    db.exec("INSERT INTO users (id, email, display_name, is_active, last_login, created_at) VALUES (1, 'alice@example.org', 'Alice', 1, '2021-01-01', '2021-01-01')");
    
    // Retrieve the user from the database
    const userRow = db.prepare("SELECT * FROM users WHERE id = 1").get(1);
	console.log(userRow);
    expect(userRow).toBeDefined();
	expect(userRow.id).toBe('1');
    expect(userRow.email).toBe('alice@example.org');
    expect(userRow.display_name).toBe('Alice');
	expect(userRow.is_active).toBe(1);
	expect(userRow.last_login).toBe('2021-01-01');
	expect(userRow.created_at).toBe('2021-01-01');
  });
});