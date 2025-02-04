import express from 'express';
const router = express.Router();
import { poolPromise } from '../db.js';
import sql from 'mssql';

// Endpoint: Get column names for tables
router.get('/columns', async (req, res) => {
	const { table } = req.query; // Get table name from query parameters

	// Validate table name to prevent SQL injection
	if (!table || !/^[a-zA-Z0-9_]+$/.test(table)) {
		return res.status(400).json({ error: 'Invalid input or missing table name.' });
	}

	try {
		const pool = await poolPromise;
		const query = `
		SELECT COLUMN_NAME 
		FROM INFORMATION_SCHEMA.COLUMNS 
		WHERE TABLE_NAME = @table
		`;
		const result = await pool.request()
			.input('table', sql.NVarChar, table)
			.query(query);

		const columnNames = result.recordset.map(row => row.COLUMN_NAME);
		res.json({ table, columns: columnNames });
	} catch (error) {
		console.error(`Error fetching column names for table ${table}:`, error);
		res.status(500).send('Error retrieving table columns');
	}
});

export default router;