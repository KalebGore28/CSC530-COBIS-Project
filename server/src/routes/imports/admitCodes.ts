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

const router = express.Router()
router.post('/admit_codes', async (req, res) => {
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
const mappedData = z.array(z.object({
	code: z.string(),
	description: z.string(),
}));

const fileName = z.string();
const importedBy = z.string();

export const importAdmitCodesSpec = {
	'/api/import/admit_codes': {
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