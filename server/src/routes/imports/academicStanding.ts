import express, { Request, Response } from 'express';
import { importData } from '../../utils/importData';
import { academicStanding } from '../../db/schema';
import 'zod-openapi/extend';
import { z } from 'zod';

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

/**
 * Import academic standing data
 * @param mappedData - The academic standing data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/academic-standing', async (req: Request, res: Response) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importAcademicStanding(mappedData, fileName, importedBy);
		res.json({
			message: 'Academic standing imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails,
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing academic standing data: ${error.message}`);
		res.status(500).json({ error: 'Error importing academic standing data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	code: z.string().openapi({ description: 'The academic standing code', example: 'GS', ref: 'academic_standing_code' }),
	description: z.string().openapi({ description: 'The academic standing description', example: 'Good Standing', ref: 'academic_standing_description' }),
})).openapi({ description: 'The academic standing data to import', ref: 'academic_standing_mapped_data' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'courses.csv', ref: 'academic_standing_filename' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'academic_standing_imported_by' });

export const academicStandingSpec = {
	'/api/import/academic-standing': {
		post: {
			tags: ['Imports'],
			operationId: 'import_academic_standing',
			description: 'Import academic standing data',
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
				'200': {
					description: '200 OK',
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