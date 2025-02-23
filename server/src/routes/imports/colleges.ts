import express from 'express';
import { importData } from './helpers.js';
import { colleges } from '../../db/models/colleges.js';

interface CollegeRow {
	code: string;
	description: string;
}

async function importColleges(
	mappedData: CollegeRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		colleges,
		'code',
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/colleges', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importColleges(mappedData, fileName, importedBy);
		res.json({
			message: 'Colleges imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing colleges data: ${error.message}`);
		res.status(500).json({ error: 'Error importing colleges data.' });
	}
});

export default router;