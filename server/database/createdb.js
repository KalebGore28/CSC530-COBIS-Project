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
        title TEXT NOT NULL,
        hours INTEGER NOT NULL,
        course_fee REAL,
        web_fee REAL,
        last_changed TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create the import history table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS imports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        total_records INTEGER NOT NULL,
        error_details TEXT,
        import_status TEXT NOT NULL DEFAULT 'Pending',
        imported_by TEXT NOT NULL,
        import_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `);

    console.log('Tables initialized successfully.');
  } catch (err) {
    console.error('Error initializing tables:', err.message);
  }

  return db;
};

initializeDatabase();