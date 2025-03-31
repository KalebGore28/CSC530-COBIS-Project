import express, { Request, Response } from 'express';
import { importData } from '../../utils/importData';
import { terms } from '../../db/models/terms';
import 'zod-openapi/extend';
import { z } from 'zod';

interface TermRow {
	code: string;
	description: string;
}

async function importTerms(
	mappedData: TermRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		terms,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

/**
 * Import terms data
 * @param mappedData - The terms data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/terms', async (req: Request, res: Response) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importTerms(mappedData, fileName, importedBy);
		res.json({
			message: 'Terms imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing terms data: ${error.message}`);
		res.status(500).json({ error: 'Error importing terms data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	code: z.string().openapi({ description: 'The term code', example: '10', ref: 'terms_code' }),
	description: z.string().openapi({ description: 'The term description', example: 'Spring TERM', ref: 'terms_description' }),
})).openapi({ description: 'The terms data to import', ref: 'terms_mapped_data' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'terms.csv', ref: 'terms_filename' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'terms_imported_by' });

export const importTermsSpec = {
	'/api/import/terms': {
		post: {
			tags: ['Imports'],
			operationId: 'import_terms',
			description: 'Import terms data',
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
					description: 'Terms imported successfully',
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