import express, { Request, Response } from 'express';
import { importData } from '../../utils/importData';
import { collegeCodes } from '../../db/schema';
import 'zod-openapi/extend';
import { z } from 'zod';

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

/**
 * Import college codes data
 * @param mappedData - The college codes data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/college-codes', async (req: Request, res: Response) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importCollegeCodes(mappedData, fileName, importedBy);
		res.json({
			message: 'College codes imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing college codes data: ${error.message}`);
		res.status(500).json({ error: 'Error importing college codes data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	code: z.string().openapi({ description: 'The college code', example: '0003', ref: 'college_codes_code' }),
	description: z.string().openapi({ description: 'The college description', example: 'Faulkner University', ref: 'college_codes_description' }),
})).openapi({ description: 'The college codes data to import', ref: 'college_codes_mapped_data' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'college-codes.csv', ref: 'college_codes_filename' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'college_codes_imported_by' });

export const collegeCodesSpec = {
	'/api/import/college-codes': {
		post: {
			tags: ['Imports'],
			operationId: 'import_college_codes',
			description: 'Import college codes data',
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
};

export default router;