import express from 'express';
import { importData } from './helpers.ts';

const router = express.Router();

router.post('/subject_prefixes', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map(row => {
			return {
				college: row.college,
				department: row.department,
				prefix: row.prefix,
			};
		});

		const result = await importData('subject_prefixes', ['college', 'department', 'prefix'], transformedData, fileName, importedBy);
		res.json({
			message: 'Course prefixes imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing course prefixes data: ${error.message}`);
		res.status(500).json({ error: 'Error importing course prefixes data.' });
	}
});

export default router;