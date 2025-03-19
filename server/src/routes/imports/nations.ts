import express, { Request, Response } from 'express';
import { importData } from '../../utils/importData';
import { nations } from '../../db/models/nations';
import 'zod-openapi/extend';
import { z } from 'zod';

interface NationRow {
	code: string;
	description: string;
}

async function importNations(
	mappedData: NationRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		nations,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router()
router.post('/nations', async (req: Request, res: Response) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importNations(mappedData, fileName, importedBy);
		res.json({
			message: 'Nations imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing nations data: ${error.message}`);
		res.status(500).json({ error: 'Error importing nations data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	code: z.string().openapi({ description: 'The nation code', example: '55913', ref: 'nations_code' }),
	description: z.string().openapi({ description: 'The nation description', example: 'United States', ref: 'nations_description' }),
})).openapi({ description: 'The nation data to import', ref: 'nations_mapped_data' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'nations.csv', ref: 'nations_filename' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'nations_imported_by' });

export const importNationsSpec = {
	'/api/import/nations': {
		post: {
			tags: ['Imports'],
			operationId: 'import_nations',
			description: 'Import nations data',
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