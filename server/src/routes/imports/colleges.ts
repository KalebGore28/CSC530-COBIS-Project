import express from 'express';
import { importData } from '../../utils/importData';
import { colleges } from '../../db/schema';
import { z } from 'zod';

interface CollegeRow {
	code: string;
	description: string;
}

async function importColleges(
	mappedData: CollegeRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		colleges,
		'code',
		mappedData,
		fileName,
		importedBy
	);
}

/**
 * Import college data
 * @param mappedData - The college data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/colleges', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importColleges(mappedData, fileName, importedBy);
		res.json({
			message: 'Colleges imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing colleges data: ${error.message}`);
		res.status(500).json({ error: 'Error importing colleges data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	code: z.string().openapi({ description: 'The college code', example: 'BP', ref: 'collegeCode' }),
	description: z.string().openapi({ description: 'The college description', example: 'Business', ref: 'collegeDescription' }),
}));
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'colleges.csv', ref: 'collegeFileName' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'collegeImportedBy' });

export const importCollegesSpec = {
	'/api/import/colleges': {
		post: {
			tags: ['Imports'],
			operationId: 'importColleges',
			description: 'Import college data',
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