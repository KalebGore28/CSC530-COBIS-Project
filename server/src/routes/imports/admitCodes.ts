import express from 'express';
import { importData } from '../../utils/importData';
import { admitCodes } from '../../db/schema';
import 'zod-openapi/extend';
import { z } from 'zod';

interface AdmitCodeRow {
	code: string;
	description: string;
}

async function importAdmitCodes(
	mappedData: AdmitCodeRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		admitCodes,
		'code',
		mappedData,
		fileName,
		importedBy
	);
}

/**
 * Import admit codes data
 * @param mappedData - The admit codes data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/admit-codes', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importAdmitCodes(mappedData, fileName, importedBy);
		res.json({
			message: 'Admit codes imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing admit codes data: ${error.message}`);
		res.status(500).json({ error: 'Error importing admit codes data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	code: z.string().openapi({ description: 'The admit code', example: 'G1', ref: 'admitCode' }),
	description: z.string().openapi({ description: 'The admit code description', example: 'Graduate-with UG degree', ref: 'admitCodeDescription' }),
})).openapi({ description: 'The admit codes data to import', ref: 'admitCodesMappedData' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'admit-codes.csv', ref: 'admitCodesFileName' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'admitCodesImportedBy' });

export const importAdmitCodesSpec = {
	'/api/import/admit-codes': {
		post: {
			tags: ['Imports'],
			operationId: 'importAdmitCodes',
			description: 'Import admit codes data',
			requestBody: {
				content: {
					'application/json': {
						schema: z.object({
							mappedData,
							fileName,
							importedBy
						})
					}
				}
			},
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								message: z.string(),
								totalRecords: z.number(),
								errors: z.array(z.object({
									row: z.number(),
									error: z.string()
								}))
							})
						}
					}
				}
			}
		}
	}
}

export default router;