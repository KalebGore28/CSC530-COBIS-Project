import express from 'express';
import { importData } from './helpers.js';

const router = express.Router();

router.post('/academic_standing', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importData('academic_standing', 'code', mappedData, fileName, importedBy);
		res.json({
			message: 'Academic standing imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing academic standing data: ${error.message}`);
		res.status(500).json({ error: 'Error importing academic standing data.' });
	}
});

export default router;