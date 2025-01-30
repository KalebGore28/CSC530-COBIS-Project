const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const isDev = process.env.NODE_ENV !== 'prod';
const defaultDevDBPath = path.join(__dirname, 'db.sqlite');
const DB_PATH = isDev ? defaultDevDBPath : process.env.DB_PATH;

// Ensure the database file exists in dev mode; warn in prod mode if missing
if (isDev) {
	if (!fs.existsSync(DB_PATH)) {
		console.log(`⚠️ No existing database found in dev mode. Creating new SQLite database at: ${DB_PATH}`);
	}
} else if (!DB_PATH) {
	console.error('❌ Error: DB_PATH is required in production mode. Set it in your .env file.');
	process.exit(1);
}

// Initialize SQLite database
console.log(`🔗 Connecting to SQLite database at: ${DB_PATH}`);
const db = new sqlite3.Database(DB_PATH, (err) => {
	if (err) {
		console.error('❌ Database connection error:', err.message);
		process.exit(1);
	}
});

// Function to create necessary tables asynchronously
const runQuery = (query) => {
	return new Promise((resolve, reject) => {
		db.run(query, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
};

const initialize = async () => {
	try {
		await runQuery(`
			CREATE TABLE IF NOT EXISTS departments (
				code TEXT PRIMARY KEY,
				description TEXT NOT NULL,
				prefixes TEXT,
				canvas_id TEXT,
				college TEXT
			)
		`);

		await runQuery(`
			CREATE TABLE IF NOT EXISTS courses (
				course TEXT PRIMARY KEY,
				title TEXT NOT NULL,
				hours INTEGER NOT NULL,
				course_fee REAL,
				web_fee REAL,
				last_changed TEXT DEFAULT CURRENT_TIMESTAMP
			)
		`);

		await runQuery(`
			CREATE TABLE IF NOT EXISTS imports (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				entity_type TEXT NOT NULL,
				file_name TEXT NOT NULL,
				total_records INTEGER NOT NULL,
				error_details TEXT,
				import_status TEXT NOT NULL,
				imported_by TEXT NOT NULL,
				import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`);

		console.log("✅ Database verification complete. All necessary tables exist.");
	} catch (error) {
		console.error("❌ Error ensuring database tables:", error.message);
		process.exit(1);
	}
};

module.exports = { db, initialize };