import express from 'express';
import { importData } from './helpers.js';

const router = express.Router();

router.post('/departments', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map(row => {

			// Split the prefixes into an array
			const prefixes = row.prefixes.split(',').map(p => p.trim()).filter(p => p.length > 0);

			return {
				code: row.code,
				description: row.description,
				prefixes: row.prefixes === 'NULL' ? null : prefixes.join(','),
				canvas_id: parseInt(row.canvas_id, 10) || null,
				college: row.college === 'NULL' ? "UNASSIGNED" : row.college
			};
		});

		const columnTypes = {
			code: 'nvarchar',
			description: 'nvarchar',
			prefixes: 'nvarchar',
			canvas_id: 'int',
			college: 'nvarchar'
		};

		const result = await importData('departments', 'code', transformedData, fileName, importedBy, columnTypes);
		res.json({
			message: 'Departments imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing departments data: ${error.message}`);
		res.status(500).json({ error: 'Error importing departments data.' });
	}
});

export default router;