import express from 'express';
import { importData } from './helpers.js';

const router = express.Router();

router.post('/student_types', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importData('student_types', 'code', mappedData, fileName, importedBy);
		res.json({
			message: 'Student types imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing student type data: ${error.message}`);
		res.status(500).json({ error: 'Error importing student type data.' });
	}
});

export default router;