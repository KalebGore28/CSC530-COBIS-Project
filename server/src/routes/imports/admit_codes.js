import express from 'express';
import { importData } from './helpers.ts';

const router = express.Router();

router.post('/admit_codes', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importData('admit_codes', 'code', mappedData, fileName, importedBy);
		res.json({
			message: 'Admit codes imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing admit codes data: ${error.message}`);
		res.status(500).json({ error: 'Error importing admit codes data.' });
	}
});

export default router;