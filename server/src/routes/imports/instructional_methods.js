import express from 'express';
import { importData } from './helpers.js';

const router = express.Router();

router.post('/instructional_methods', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importData('instructional_methods', 'code', mappedData, fileName, importedBy);
		res.json({
			message: 'Instructional methods imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing instructional methods data: ${error.message}`);
		res.status(500).json({ error: 'Error importing instructional methods data.' });
	}
});

export default router;