import express from 'express';
const router = express.Router();
import { poolPromise } from '../db.js';
import { buildInsertQuery, buildUpdateQuery, buildLogQuery } from '../utils/queryBuilders.js';
import generatePDF from '../utils/pdfGenerator.js';
import sql from 'mssql';

// Endpoint: Get column names for the colleges table
router.get('/column-names', async (req, res) => {
	const tableName = 'colleges';

	try {
		const pool = await poolPromise;
		const query = `
	  SELECT COLUMN_NAME
	  FROM INFORMATION_SCHEMA.COLUMNS
	  WHERE TABLE_NAME = @tableName
	`;
		const result = await pool.request()
			.input('tableName', sql.NVarChar, tableName)
			.query(query);

		const columnNames = result.recordset.map(row => row.COLUMN_NAME);
		res.json({ table: tableName, columns: columnNames });
	} catch (error) {
		console.error(`Error fetching column names for table ${tableName}:`, error);
		res.status(500).send('Error retrieving table columns');
	}
});

// Endpoint:
router.post('/import', async (req, res) => {
	const { mappedData, fileName, importedBy } = req.body;

	if (!Array.isArray(mappedData) || mappedData.length === 0) {
		return res.status(400).json({ error: 'Invalid CSV data.' });
	}

	let totalRecords = mappedData.length;
	let errorDetails = [];

	try {
		const pool = await poolPromise;

		for (const row of mappedData) {
			const { code, ...data } = row; // Extract primary key separately

			try {
				// 1️⃣ CHECK IF ROW EXISTS
				const checkQuery = `SELECT COUNT(*) AS count FROM colleges WHERE code = @code`;
				const checkResult = await pool.request()
					.input('code', sql.NVarChar, code)
					.query(checkQuery);

				const exists = checkResult.recordset[0].count > 0;

				if (exists) {
					// 2️⃣ UPDATE IF ROW EXISTS
					const { query, columns } = buildUpdateQuery("colleges", data, "code");

					const updateRequest = pool.request().input('code', sql.NVarChar, code);
					columns.forEach(col => updateRequest.input(col, sql.NVarChar, data[col]));

					await updateRequest.query(query);
				} else {
					// 3️⃣ INSERT NEW ROW, OMITTING NULL VALUES SO SQL Server USES DEFAULTS
					const { query, columns } = buildInsertQuery("colleges", row);

					const insertRequest = pool.request();
					columns.forEach(col => insertRequest.input(col, sql.NVarChar, row[col]));

					await insertRequest.query(query);
				}
			} catch (error) {
				errorDetails.push({ row, error: error.message });
				console.error(`Error processing row:`, error.message);
			}
		}

		// 4️⃣ LOG IMPORT OPERATION USING `buildLogQuery`
		const logData = {
			entity_type: 'colleges',
			file_name: fileName || 'Unknown File',
			import_status: 'Completed',
			imported_by: importedBy || 'System',
			total_records: parseInt(totalRecords, 10),
			error_details: errorDetails.length > 0 ? JSON.stringify(errorDetails) : null
		};

		const { query: logQuery, columns: logColumns } = buildLogQuery("imports", logData);
		const logRequest = pool.request();
		logColumns.forEach(col => {
			if (col === 'total_records') {
				logRequest.input(col, sql.Int, logData[col]); // Explicitly set as INT
			} else {
				logRequest.input(col, sql.NVarChar, logData[col]);
			}
		});

		await logRequest.query(logQuery);

		res.json({
			message: 'Colleges imported successfully.',
			totalRecords,
			errors: errorDetails
		});

	} catch (error) {
		console.error(`Error importing college data:`, error.message);
		res.status(500).json({ error: 'Error importing college data.' });
	}
});

export default router;