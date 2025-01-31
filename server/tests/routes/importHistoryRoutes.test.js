import { describe, beforeAll, beforeEach, afterAll, test, expect } from 'vitest';
import request from 'supertest';
import sql from 'mssql';
import app from '../../app.js';
import { poolPromise } from '../../db.js';

// Ensure imports table is created before running tests
beforeAll(async () => {
  const pool = await poolPromise;
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'imports')
    BEGIN
      CREATE TABLE imports (
        id INT IDENTITY(1,1) PRIMARY KEY,
        entity_type NVARCHAR(255) NOT NULL,
        file_name NVARCHAR(255) NOT NULL,
        total_records INT NOT NULL,
        error_details NVARCHAR(MAX) NULL,
        import_status NVARCHAR(50) NOT NULL,
        imported_by NVARCHAR(255) NOT NULL,
        import_date DATETIME DEFAULT GETDATE()
      );
    END;
  `);
});

// Clear the imports table before each test
beforeEach(async () => {
  const pool = await poolPromise;
  await pool.request().query(`
    DELETE FROM imports;
    DBCC CHECKIDENT ('imports', RESEED, 0);
  `);
});

// Close the SQL connection after all tests are complete
afterAll(async () => {
  await sql.close();
});

describe('Import History API Endpoints', () => {
  test('GET /import-history should return an empty list initially', async () => {
    const res = await request(app).get('/import-history');

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(0);
  });

  test('POST /departments/import should insert an import record', async () => {
    // Used to generate a unique file name for each test
    const file_seed_name = `test_import_${Date.now()}.csv`;

    const testData = {
      mappedData: [
        { code: 'CSC', description: 'Computer Science', prefixes: 'CIS,CSC', canvas_id: 130292, college: 'BP' }
      ],
      fileName: file_seed_name,
      importedBy: 'Test User'
    };

    const res = await request(app)
      .post('/departments/import')
      .send(testData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Departments imported successfully.');

    // Check import history
    const historyRes = await request(app).get('/import-history');
    expect(historyRes.status).toBe(200);

    const insertedRecord = historyRes.body.find(entry => entry.file_name === file_seed_name);
    expect(insertedRecord).toBeDefined();
    expect(insertedRecord.file_name).toBe(file_seed_name);
    expect(insertedRecord.imported_by).toBe('Test User');
  });

  test('GET /import-history?entity=departments should filter results', async () => {
    // Used to generate a unique file name for each test
    const file_seed_name = `test_import_${Date.now()}.csv`;
    
    // Insert a record for departments
    const testData = {
      mappedData: [
        { code: 'CSC', description: 'Computer Science', prefixes: 'CIS,CSC', canvas_id: 130292, college: 'BP' }
      ],
      fileName: file_seed_name,
      importedBy: 'Test User'
    };

    await request(app)
      .post('/departments/import')
      .send(testData);

    const res = await request(app).get('/import-history?entity=departments');

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].entity_type).toBe('departments');
  });
});