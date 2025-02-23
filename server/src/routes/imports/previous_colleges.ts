import express from 'express';
import { importData, convertDateDDMMYYYY } from './helpers';
import { previousColleges } from '../../db/models/previous_colleges';

interface PreviousCollegeRow {
	mnumber: string;
	collegecode: string;
	collegedesc: string;
	degree: string;
	degreedate: string;
}

async function importPreviousColleges(
	mappedData: PreviousCollegeRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		previousColleges,
		['mnumber', 'college_code'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/previous_colleges', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map((row: { mnumber: string; collegecode: string; collegedesc: string; degree: string; degreedate: string; }) => {
			return {
				mnumber: row.mnumber,
				college_code: row.collegecode,
				college_description: row.collegedesc,
				degree: row.degree,
				date: convertDateDDMMYYYY(row.degreedate),
			};
		});

		const result = await importPreviousColleges(transformedData, fileName, importedBy);
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