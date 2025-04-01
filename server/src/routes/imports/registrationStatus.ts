import express, { Request, Response } from 'express';
import { importData } from '../../utils/importData';
import { registrationStatus } from '../../db/models/registration-status';
import 'zod-openapi/extend';
import { z } from 'zod';

interface RegistrationStatusRow {
	code: string;
	description: string;
}

async function importRegistrationStatus(
	mappedData: RegistrationStatusRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		registrationStatus,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

/**
 * Import registration status data
 * @param mappedData - The registration status data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/registration-status', async (req: Request, res: Response) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importRegistrationStatus(mappedData, fileName, importedBy);
		res.json({
			message: 'Registration status imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing registration status data: ${error.message}`);
		res.status(500).json({ error: 'Error importing registration status data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	code: z.string().openapi({ description: 'The registration status code', example: 'RW', ref: 'registration_status_code' }),
	description: z.string().openapi({ description: 'The registration status description', example: 'Web Registered', ref: 'registration_status_description' }),
})).openapi({ description: 'The registration status data to import', ref: 'registration_status_mapped_data' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'registration-status.csv', ref: 'registration_status_filename' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'registration_status_imported_by' });

export const importRegistrationStatusSpec = {
	'/api/import/registration-status': {
		post: {
			tags: ['Imports'],
			operationId: 'import_registration_status',
			description: 'Import registration status data',
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
								errors: z.array(z.string()),
							}),
						}
					}
				}
			}
		}
	}
};

export default router;