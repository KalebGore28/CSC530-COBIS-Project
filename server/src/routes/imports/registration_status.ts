import express from 'express';
import { importData } from './helpers';
import { registrationStatus } from '../../db/models/registration_status';

interface RegistrationStatusRow {
	code: string;
	description: string;
}

async function importRegistrationStatus(
	mappedData: RegistrationStatusRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		registrationStatus,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/registration_status', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importRegistrationStatus(mappedData, fileName, importedBy);
		res.json({
			message: 'Registration status imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing registration status data: ${error.message}`);
		res.status(500).json({ error: 'Error importing registration status data.' });
	}
});

export default router;