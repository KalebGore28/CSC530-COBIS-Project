import express from 'express';
import { importData } from './helpers.ts';

const router = express.Router();

router.post('/nations', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importData('nations', 'code', mappedData, fileName, importedBy);
		res.json({
			message: 'Nations imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing nations data: ${error.message}`);
		res.status(500).json({ error: 'Error importing nations data.' });
	}
});

export default router;