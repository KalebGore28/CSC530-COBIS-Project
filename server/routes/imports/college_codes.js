import express from 'express';
import { importData } from './helpers.js';

const router = express.Router();

router.post('/college_codes', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		const result = await importData('college_codes', 'code', mappedData, fileName, importedBy);
		res.json({
			message: 'College codes imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing college codes data: ${error.message}`);
		res.status(500).json({ error: 'Error importing college codes data.' });
	}
});

export default router;