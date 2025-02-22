import express from 'express';
import { importData } from './helpers.ts';

const router = express.Router();

router.post('/registration_status', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importData('registration_status', 'code', mappedData, fileName, importedBy);
		res.json({
			message: 'Registration status imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing registration status data: ${error.message}`);
		res.status(500).json({ error: 'Error importing registration status data.' });
	}
});

export default router;