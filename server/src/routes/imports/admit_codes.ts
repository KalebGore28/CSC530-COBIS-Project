import express from 'express';
import { importData } from './helpers';
import { admitCodes } from '../../db/models/admit_codes';

interface AdmitCodeRow {
	code: string;
	description: string;
}

async function importAdmitCodes(
	mappedData: AdmitCodeRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		admitCodes,
		'code',
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/admit_codes', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importAdmitCodes(mappedData, fileName, importedBy);
		res.json({
			message: 'Admit codes imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing admit codes data: ${error.message}`);
		res.status(500).json({ error: 'Error importing admit codes data.' });
	}
});

export default router;