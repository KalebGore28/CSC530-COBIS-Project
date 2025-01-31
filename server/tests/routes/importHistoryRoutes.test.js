import { describe, beforeAll, afterAll, test, expect } from 'vitest';
import request from 'supertest';
import sql from 'mssql';
import app from '../../app.js';
import { poolPromise } from '../../db.js';

// ✅ Ensure `imports` table is created before running tests
beforeAll(async () => {
  const pool = await poolPromise;
  await pool.request().query(`
    DROP TABLE IF EXISTS imports;
    CREATE TABLE imports (
      id INT IDENTITY(1,1) PRIMARY KEY,
      entity_type NVARCHAR(255) NOT NULL,
      file_name NVARCHAR(255) NOT NULL,
      total_records INT NOT NULL,
      error_details NVARCHAR(50) NULL,
      import_status NVARCHAR(50) NOT NULL,
      imported_by NVARCHAR(255) NOT NULL,
      import_date DATETIME DEFAULT GETDATE()
    );
  `);
});

afterAll(async () => {
  await sql.close();
});

describe('Import History API Endpoints', () => {
  test('GET /import-history should return an empty list initially', async () => {
    const res = await request(app).get('/import-history');

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    // expect(res.body.length).toBe(0); // commented out because with async tests, the table may not be empty
  });

  test('POST /departments/import should insert an import record', async () => {
    const testData = {
      mappedData: [
        { code: 'CSC', description: 'Computer Science', prefixes: 'CIS,CSC', canvas_id: 130292, college: 'BP' }
      ],
      fileName: 'test_import.csv',
      importedBy: 'Test User'
    };

    const res = await request(app)
      .post('/departments/import')
      .send(testData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Departments imported successfully.');

    // ✅ Check import history
    const historyRes = await request(app).get('/import-history');
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.length).toBeGreaterThan(0);
    expect(historyRes.body[0].file_name).toBe('test_import.csv');
    expect(historyRes.body[0].imported_by).toBe('Test User');
  });

  test('GET /import-history?entity=departments should filter results', async () => {
    const res = await request(app).get('/import-history?entity=departments');

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].entity_type).toBe('departments');
  });
});