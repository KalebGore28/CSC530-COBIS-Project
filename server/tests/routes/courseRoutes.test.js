import { describe, beforeAll, afterAll, test, expect } from 'vitest';
import request from 'supertest';
import sql from 'mssql';
import app from '../../app';

import { poolPromise } from '../../db';

// Reset test database before tests run
beforeAll(async () => {
  const pool = await poolPromise;
  await pool.request().query(`
    DROP TABLE IF EXISTS courses;
    CREATE TABLE courses (
      course NVARCHAR(50) PRIMARY KEY,
      title NVARCHAR(255),
      hours INT,
      course_fee DECIMAL(10,2),
      web_fee DECIMAL(10,2)
    );
  `);
});

afterAll(async () => {
  await sql.close();
});

describe('Course API Endpoints', () => {
  test('GET /courses/column-names should return table columns', async () => {
    const res = await request(app).get('/courses/column-names');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('table');
    expect(res.body.columns).toContain('course');
    expect(res.body.columns).toContain('title');
  });

  test('POST /courses/import should insert course data', async () => {
    const testData = {
      mappedData: [
        { course: 'CSC101', title: 'Intro to Programming', hours: 3, course_fee: 200.5, web_fee: 50.0 }
      ],
      fileName: 'test.csv',
      importedBy: 'Test User'
    };

    const res = await request(app)
      .post('/courses/import')
      .send(testData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Courses imported successfully.');

    // Verify inserted data in database
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM courses WHERE course = \'CSC101\'');
    expect(result.recordset.length).toBe(1);
    expect(result.recordset[0].title).toBe('Intro to Programming');
  });
});