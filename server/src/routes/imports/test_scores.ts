import express from 'express';
import { importData, convertDateMMDDYYYY } from './helpers';
import { testScores } from '../../db/models/test_scores';

interface TestScoreRow {
	mnumber: string;
	testcode: string;
	testdesc: string;
	testscore: string;
	testdate: string;
}

async function importTestScores(
	mappedData: TestScoreRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		testScores,
		['mnumber', 'code', 'date'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/test_scores', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map((row: { mnumber: string; testcode: string; testdesc: string; testscore: string; testdate: string; }) => {
			return {
				mnumber: row.mnumber,
				code: row.testcode,
				description: row.testdesc,
				score: parseFloat(row.testscore) || 0,
				date: convertDateMMDDYYYY(row.testdate),
			};
		});

		const columnTypes = {
			mnumber: 'nvarchar',
			code: 'nvarchar',
			description: 'nvarchar',
			score: 'decimal',
			date: 'datetime',
		};

		const result = await importTestScores(transformedData, fileName, importedBy);
		res.json({
			message: 'Test scores imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing test scores data: ${error.message}`);
		res.status(500).json({ error: 'Error importing test scores data.' });
	}
});

export default router;