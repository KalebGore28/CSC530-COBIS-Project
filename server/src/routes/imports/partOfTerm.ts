import express from 'express';
import { importData } from '../../utils/importData';
import { partOfTerm } from '../../db/models/part_of_term';
import 'zod-openapi/extend';
import { z } from 'zod';

interface PartOfTermRow {
	code: string;
	description: string;
}

async function importPartOfTerm(
	mappedData: PartOfTermRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		partOfTerm,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

/**
 * Import part of term data
 * @param mappedData - The part of term data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/part-of-term', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importPartOfTerm(mappedData, fileName, importedBy);
		res.json({
			message: 'Part of term imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing part of term data: ${error.message}`);
		res.status(500).json({ error: 'Error importing part of term data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	code: z.string().openapi({ description: 'The part of term code', example: '1', ref: 'partOfTermCode' }),
	description: z.string().openapi({ description: 'The part of term description', example: 'Full Term', ref: 'partOfTermDescription' }),
}));
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'part-of-term.csv', ref: 'partOfTermFileName' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'partOfTermImportedBy' });

export const importPartOfTermSpec = {
	'/api/import/part-of-term': {
		post: {
			tags: ['Imports'],
			operationId: 'importPartOfTerm',
			description: 'Import part of term data',
			requestBody: {
				content: {
					'application/json': {
						schema: z.object({
							mappedData: mappedData,
							fileName: fileName,
							importedBy: importedBy,
						}),
					},
				},
			},
			responses: {
				'200': {
					description: 'Part of term imported successfully',
					content: {
						'application/json': {
							schema: z.object({
								message: z.string().openapi({ description: 'Success message', example: 'Part of term imported successfully', ref: 'partOfTermImportSuccessMessage' }),
								totalRecords: z.number().openapi({ description: 'Total number of records imported', example: 5, ref: 'partOfTermTotalRecords' }),
								errors: z.array(z.object({
									row: z.number().openapi({ description: 'Row number', example: 3, ref: 'partOfTermRowNumber' }),
									error: z.string().openapi({ description: 'Error message', example: 'Invalid part of term code', ref: 'partOfTermError' }),
								})).openapi({ description: 'Errors encountered during import', ref: 'partOfTermErrors' }),
							}),
						},
					},
				},
				'400': {
					description: 'Invalid request data',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({ description: 'Error message', example: 'Invalid request data', ref: 'partOfTermInvalidRequestData' }),
							}),
						},
					},
				},
				'500': {
					description: 'Error importing part of term data',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({ description: 'Error message', example: 'Error importing part of term data', ref: 'partOfTermImportError' }),
							}),
						},
					},
				},
			},
		},
	},
};

export default router;