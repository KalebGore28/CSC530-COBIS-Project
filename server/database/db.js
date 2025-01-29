const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/db.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    db.run("PRAGMA foreign_keys = ON");
  }
});

module.exports = db;