import { describe, beforeAll, afterAll, test, expect } from 'vitest';
import request from 'supertest';
import sql from 'mssql';
import app from '../../app.js';
import { poolPromise } from '../../db.js';

// ✅ Before running tests, initialize the test database
beforeAll(async () => {
  const pool = await poolPromise;
  await pool.request().query(`
    DROP TABLE IF EXISTS departments;
    CREATE TABLE departments (
      code NVARCHAR(50) PRIMARY KEY,
      description NVARCHAR(255),
      prefixes NVARCHAR(255),
      canvas_id INT,
      college NVARCHAR(255)
    );
  `);
});

afterAll(async () => {
  await sql.close();
});

describe('Department API Endpoints', () => {
  test('GET /departments/column-names should return department column names', async () => {
    const res = await request(app).get('/departments/column-names');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('table');
    expect(res.body.columns).toContain('code');
    expect(res.body.columns).toContain('description');
    expect(res.body.columns).toContain('college');
  });

  test('POST /departments/import should insert department data', async () => {
    const testData = {
      mappedData: [
        { code: 'CSC', description: 'Computer Science', prefixes: 'CIS,CSC', canvas_id: 130292, college: 'BP' }
      ],
      fileName: 'test.csv',
      importedBy: 'Test User'
    };

    const res = await request(app)
      .post('/departments/import')
      .send(testData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Departments imported successfully.');

    // ✅ Verify inserted data in database
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM departments WHERE code = 'CSC'");
    expect(result.recordset.length).toBe(1);
    expect(result.recordset[0].description).toBe('Computer Science');
  });

  test('GET /departments/pdf-report should return a PDF', async () => {
    const res = await request(app).get('/departments/pdf-report');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
  });
});