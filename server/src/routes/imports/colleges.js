import express from 'express';
import { importData } from './helpers.js';

const router = express.Router();

router.post('/colleges', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importData('colleges', 'code', mappedData, fileName, importedBy);
		res.json({
			message: 'Colleges imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing colleges data: ${error.message}`);
		res.status(500).json({ error: 'Error importing colleges data.' });
	}
});

export default router;