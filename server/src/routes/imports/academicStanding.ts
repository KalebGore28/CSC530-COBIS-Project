import express from 'express';
import { importData } from '../../utils/importData';
import { academicStanding } from '../../db/schema';
import 'zod-openapi/extend';
import { z } from 'zod';

interface AcademicStandingRow {
	code: string;
	description: string;
}

async function importAcademicStanding(
	mappedData: AcademicStandingRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		academicStanding,    // table definition
		"code",              // primary key field (or use ['code'] for a composite key)
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router()
router.post('/academic-standing', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importAcademicStanding(mappedData, fileName, importedBy);
		res.json({
			message: 'Academic standing imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails,
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing academic standing data: ${error.message}`);
		res.status(500).json({ error: 'Error importing academic standing data.' });
	}
});
const mappedData = z.array(z.object({
	code: z.string(),
	description: z.string(),
}));

const fileName = z.string();
const importedBy = z.string();

export const importAcademicStandingSpec = {
	'/api/import/academic-standing': {
		post: {
			tags: ['Imports'],
			operationId: 'importAcademicStanding',
			description: 'Import academic standing data',
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
}

export default router;