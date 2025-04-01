import express, { Request, Response } from 'express';
import { importData } from '../../utils/importData';
import { partOfTerm } from '../../db/models/part-of-term';
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
router.post('/part-of-term', async (req: Request, res: Response) => {
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
	code: z.string().openapi({ description: 'The part of term code', example: '1', ref: 'part_of_term_code' }),
	description: z.string().openapi({ description: 'The part of term description', example: 'Full Term', ref: 'part_of_term_description' }),
})).openapi({ description: 'The part of term data to import', ref: 'part_of_term_mapped_data' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'part-of-term.csv', ref: 'part_of_term_filename' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'part_of_term_imported_by' });

export const importPartOfTermSpec = {
	'/api/import/part-of-term': {
		post: {
			tags: ['Imports'],
			operationId: 'import_part_of_term',
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