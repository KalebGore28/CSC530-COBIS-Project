import express from 'express';
import { importData } from '../../utils/importData';
import { instructionalMethods } from '../../db/models/instructional_methods';
import 'zod-openapi/extend';
import { z } from 'zod';

interface InstructionalMethodRow {
	code: string;
	description: string;
}

async function importInstructionalMethods(
	mappedData: InstructionalMethodRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		instructionalMethods,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

/**
 * Import instructional methods data
 * @param mappedData - The instructional methods data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/instructional-methods', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importInstructionalMethods(mappedData, fileName, importedBy);
		res.json({
			message: 'Instructional methods imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing instructional methods data: ${error.message}`);
		res.status(500).json({ error: 'Error importing instructional methods data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	code: z.string().openapi({ description: 'The instructional method code', example: 'CLAS', ref: 'instructionalMethodCode' }),
	description: z.string().openapi({ description: 'The instructional method description', example: 'Traditional Classroom', ref: 'instructionalMethodDescription' }),
}));
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'instructional-methods.csv', ref: 'instructionalMethodFileName' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'instructionalMethodImportedBy' });

export const importInstructionalMethodsSpec = {
	'/api/import/instructional-methods': {
		post: {
			tags: ['Imports'],
			operationId: 'importInstructionalMethods',
			description: 'Import instructional methods data',
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