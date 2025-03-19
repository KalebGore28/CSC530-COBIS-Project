import express from 'express';
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
router.post('/terms', async (req, res) => {
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
	code: z.string().openapi({ description: 'The term code', example: '10', ref: 'termCode' }),
	description: z.string().openapi({ description: 'The term description', example: 'Spring TERM', ref: 'termDescription' }),
}));
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'terms.csv', ref: 'termsFileName' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'termsImportedBy' });

export const importTermsSpec = {
	'/api/import/terms': {
		post: {
			summary: 'Import terms data',
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
				500: {
					description: 'Error importing terms data',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string(),
							}),
						},
					},
				},
			},
		},
	},
};

export default router;