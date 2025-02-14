import express from 'express';
import { importData } from './helpers.js';

const router = express.Router();

router.post('/terms', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importData('terms', 'code', mappedData, fileName, importedBy);
		res.json({
			message: 'Terms imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing terms data: ${error.message}`);
		res.status(500).json({ error: 'Error importing terms data.' });
	}
});

export default router;