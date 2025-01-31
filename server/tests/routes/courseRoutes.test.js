import { describe, beforeAll, afterAll, test, expect } from 'vitest';
import request from 'supertest';
import sql from 'mssql';
import app from '../../app'; // Adjust the import if needed

// ✅ Configure SQL Server Test Database
const testDbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrongPassw0rd',
  server: process.env.DB_SERVER || 'localhost',
  database: 'test_db',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

let pool;

beforeAll(async () => {
  pool = await sql.connect(testDbConfig);

  // 🛠 Reset the test database
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
  await sql.close(); // Close DB connection after tests
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
    const result = await pool.request().query('SELECT * FROM courses WHERE course = \'CSC101\'');
    expect(result.recordset.length).toBe(1);
    expect(result.recordset[0].title).toBe('Intro to Programming');
  });

  test('GET /courses/pdf-report should return a PDF', async () => {
    const res = await request(app).get('/courses/pdf-report');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
  });
});