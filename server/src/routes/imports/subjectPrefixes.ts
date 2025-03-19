import express from 'express';
import { importData } from '../../utils/importData';
import { subjectPrefixes } from '../../db/models/subject_prefixes';
import 'zod-openapi/extend';
import { z } from 'zod';

interface SubjectPrefixRow {
	college: string;
	department: string;
	prefix: string;
}

async function importSubjectPrefixes(
	mappedData: SubjectPrefixRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		subjectPrefixes,
		['college', 'department', 'prefix'],
		mappedData,
		fileName,
		importedBy
	);
}

/**
 * Import subject prefixes data
 * @param mappedData - The subject prefixes data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/subject-prefixes', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map((row: { college: string; department: string; prefix: string; }) => {
			return {
				college: row.college,
				department: row.department,
				prefix: row.prefix,
			};
		});

		const result = await importSubjectPrefixes(transformedData, fileName, importedBy);
		res.json({
			message: 'Course prefixes imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing course prefixes data: ${error.message}`);
		res.status(500).json({ error: 'Error importing course prefixes data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	college: z.string().openapi({ description: 'The college code', example: 'AG', ref: 'subjectPrefixCollegeCode' }),
	department: z.string().openapi({ description: 'The department code', example: 'AGR', ref: 'subjectPrefixDepartmentCode' }),
	prefix: z.string().openapi({ description: 'The subject prefix', example: 'AED', ref: 'subjectPrefix' }),
})).openapi({ description: 'The course prefixes data to import', ref: 'subjectPrefixesMappedData' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'subject-prefixes.csv', ref: 'subjectPrefixesFileName' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'subjectPrefixesImportedBy' });

export const importSubjectPrefixesSpec = {
	'/api/import/subject-prefixes': {
		post: {
			summary: 'Import subject prefixes data',
			description: 'Import subject prefixes data',
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
					description: 'Subject prefixes imported successfully',
					content: {
						'application/json': {
							schema: z.object({
								message: z.string(),
								totalRecords: z.number(),
								errors: z.array(z.object({
									row: z.number(),
									message: z.string(),
								})),
							}),
						},
					},
				},
				'500': {
					description: 'Error importing subject prefixes data',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string(),
							}),
						},
					},
				}
			}
		}
	}
};

export default router;