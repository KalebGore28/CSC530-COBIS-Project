import express from 'express';
import { importData } from './helpers';
import { collegeCodes } from '../../db/models/college_codes';

interface CollegeCodeRow {
	code: string;
	description: string;
}

async function importCollegeCodes(
	mappedData: CollegeCodeRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		collegeCodes,
		'code',
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/college_codes', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		const result = await importCollegeCodes(mappedData, fileName, importedBy);
		res.json({
			message: 'College codes imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing college codes data: ${error.message}`);
		res.status(500).json({ error: 'Error importing college codes data.' });
	}
});

export default router;