import express from 'express';
import { importData } from './helpers';
import { academicStanding } from '../../db/models/academic_standing';

interface AcademicStandingRow {
	code: string;
	description: string;
}

async function importAcademicStanding(
	mappedData: AcademicStandingRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		academicStanding,    // table definition
		"code",              // primary key field (or use ['code'] for a composite key)
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/academic_standing', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importAcademicStanding(mappedData, fileName, importedBy);
		res.json({
			message: 'Academic standing imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails,
		});
	} catch (error: any) {
		console.error(`Error importing academic standing data: ${error.message}`);
		res.status(500).json({ error: 'Error importing academic standing data.' });
	}
});

export default router;