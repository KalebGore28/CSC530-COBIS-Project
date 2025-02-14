import express from 'express';
import { importData } from './helpers.js';

const router = express.Router();

router.post('/part_of_term', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importData('part_of_term', 'code', mappedData, fileName, importedBy);
		res.json({
			message: 'Part of term imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing part of term data: ${error.message}`);
		res.status(500).json({ error: 'Error importing part of term data.' });
	}
});

export default router;