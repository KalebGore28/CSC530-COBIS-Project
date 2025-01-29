const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const initializeDatabase = async () => {
  const dbPath = path.resolve(__dirname, 'db.sqlite');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Failed to connect to the SQLite database:', err.message);
      throw err;
    } else {
      console.log('Connected to the SQLite database.');
    }
  });

  // Promisify the database operations
  const runQuery = (query) =>
    new Promise((resolve, reject) => {
      db.run(query, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

  try {
    // Create the departments table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        prefixes TEXT,
        canvas_id TEXT,
        college TEXT
      )
    `);

    // Create the courses table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course TEXT NOT NULL UNIQUE,
        crsetitle TEXT NOT NULL,
        crhrs INTEGER NOT NULL,
        course_fee REAL,
        web_fee REAL,
        lastChanged TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables initialized successfully.');
  } catch (err) {
    console.error('Error initializing tables:', err.message);
  }

  return db;
};

initializeDatabase();