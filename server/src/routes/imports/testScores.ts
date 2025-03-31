import express, { Request, Response } from 'express';
import { importData } from '../../utils/importData';
import { convertDateMMDDYYYY } from '../../utils/convertDates';
import { testScores } from '../../db/models/test_scores';
import 'zod-openapi/extend';
import { z } from 'zod';

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

/**
 * Import test scores data
 * @param mappedData - The test scores data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/test-scores', async (req: Request, res: Response) => {
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

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	mnumber: z.string().openapi({ description: 'The student M number', example: 'M100123456', ref: 'test_scores_mnumber' }),
	testcode: z.string().openapi({ description: 'The test code', example: 'ACT', ref: 'test_scores_test_code' }),
	testdesc: z.string().openapi({ description: 'The test description', example: 'ACT Composite', ref: 'test_scores_test_description' }),
	testscore: z.string().openapi({ description: 'The test score', example: '28', ref: 'test_scores_test_score' }),
	testdate: z.string().openapi({ description: 'The test date', example: '03152023', ref: 'test_scores_test_date' }),
})).openapi({ description: 'The test scores data to import', ref: 'test_scores_mapped_data' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'test-scores.csv', ref: 'test_scores_filename' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'test_scores_imported_by' });

export const importTestScoresSpec = {
	'/api/import/test-scores': {
		post: {
			tags: ['Imports'],
			operationId: 'import_test_scores',
			description: 'Import test scores data',
			requestBody: {
				content: {
					'application/json': {
						schema: z.object({
							mappedData,
							fileName,
							importedBy,
						}),
					},
				},
			},
			responses: {
				200: {
					description: 'Test scores imported successfully',
					content: {
						'application/json': {
							schema: z.object({
								message: z.string(),
								totalRecords: z.number(),
								errors: z.array(z.string()),
							}),
						},
					},
				},
			},
		},
	},
};

export default router;