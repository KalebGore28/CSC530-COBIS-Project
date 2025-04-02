import express, { Request, Response } from 'express';
import { importData } from '../../utils/importData';
import { convertDateDDMMYYYY } from '../../utils/convertDates';
import { previousColleges } from '../../db/models/previous_colleges';
import 'zod-openapi/extend';
import { z } from 'zod';

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

/**
 * Import previous college data
 * @param mappedData - The previous college data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/previous-colleges', async (req: Request, res: Response) => {
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
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing registration status data: ${error.message}`);
		res.status(500).json({ error: 'Error importing registration status data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	mnumber: z.string().openapi({ description: 'The student M number', example: 'M100123456', ref: 'previous_colleges_mnumber' }),
	collegecode: z.string().openapi({ description: 'The college code', example: '0015S', ref: 'previous_colleges_college_code' }),
	collegedesc: z.string().openapi({ description: 'The college description', example: 'Troy University ', ref: 'previous_colleges_colleges_description' }),
	degree: z.string().openapi({ description: 'The degree', example: 'BBA', ref: 'previous_colleges_degree' }),
	degreedate: z.string().openapi({ description: 'The degree date', example: '15052019', ref: 'previous_colleges_degree_date' }),
})).openapi({ description: 'The previous college data to import', ref: 'previous_colleges_mapped_data' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'previous-colleges.csv', ref: 'previous_colleges_filename' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'previous_colleges_imported_by' });

export const importPreviousCollegesSpec = {
	'/api/import/previous-colleges': {
		post: {
			tags: ['Imports'],
			operationId: 'import_previous_colleges',
			description: 'Import previous college data',
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
					description: 'Previous colleges imported successfully.',
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
}

export default router;