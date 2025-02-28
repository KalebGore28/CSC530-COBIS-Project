import express from 'express';
import { importData } from '../../utils/importData';
import { convertDateMMDDYYYY } from '../../utils/convertDates';
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

export const testScoresRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/test_scores:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import test scores data.
	 *     description: >
	 *       Imports test scores data from a CSV file. The CSV data is transformed to match the database schema:
	 *       - "testcode" is mapped to "code".
	 *       - "testdesc" is mapped to "description".
	 *       - "testscore" is parsed into a decimal score.
	 *       - "testdate" is converted to a proper date format using convertDateMMDDYYYY.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               mappedData:
	 *                 type: array
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     mnumber:
	 *                       type: string
	 *                     testcode:
	 *                       type: string
	 *                     testdesc:
	 *                       type: string
	 *                     testscore:
	 *                       type: string
	 *                     testdate:
	 *                       type: string
	 *                       description: Test date in MM/DD/YYYY format.
	 *               fileName:
	 *                 type: string
	 *               importedBy:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Test scores imported successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 message:
	 *                   type: string
	 *                 totalRecords:
	 *                   type: integer
	 *                 errors:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       row:
	 *                         type: object
	 *                       error:
	 *                         type: string
	 *       500:
	 *         description: Error importing test scores data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/test_scores', async (req, res) => {
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
			/* v8 ignore next 4 */
		} catch (error: any) {
			console.error(`Error importing test scores data: ${error.message}`);
			res.status(500).json({ error: 'Error importing test scores data.' });
		}
	});