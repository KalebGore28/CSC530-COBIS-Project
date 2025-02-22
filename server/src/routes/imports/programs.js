import express from 'express';
import { importData } from './helpers.js';

const router = express.Router();

router.post('/programs', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map(row => {
			return {
				code: row.code,
				description: row.description,
				cip_code: row.cip_code === 'NULL' ? null : row.cip_code,
				is_major: row.is_major === '1',
				is_minor: row.is_minor === '1',
				has_concentration: row.has_concentration === '1',
				is_discontinued: row.is_discontinued === '1',
				is_aacsb: row.is_aacsb === '1',
				department: row.department === 'NULL' ? 'UNASSIGNED' : row.department,
				college: row.college === 'NULL' ? 'UNASSIGNED' : row.college
			};
		});

		// console.log(transformedData);

		const result = await importData('programs', 'code', transformedData, fileName, importedBy);
		res.json({
			message: 'Programs imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing programs data: ${error.message}`);
		res.status(500).json({ error: 'Error importing programs data.' });
	}
});

export default router;