import express from 'express';
import { importData } from '../../utils/importData';
import { convertDateDDMMYYYY } from '../../utils/convertDates';
import { overrides } from '../../db/models/overrides';
import 'zod-openapi/extend';
import { z } from 'zod';

interface OverrideRow {
	mnumber: string;
	term: string;
	crn: string;
	subj: string;
	crsenumb: string;
	section: string;
	override: string;
	userid: string;
	activitydate: string;
}

async function importOverrides(
	mappedData: OverrideRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		overrides,
		['mnumber', 'term', 'year', 'crn'],
		mappedData,
		fileName,
		importedBy
	);
}

/** 
 * Import override data
 * @param mappedData - The override data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
*/
const router = express.Router()
router.post('/overrides', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map((row: { term: string; crsenumb: string; mnumber: string; crn: string; subj: string; section: string; override: string; userid: string; activitydate: string; }) => {

			const termMatch = row.term.match(/^(\d{4})(\d{2})$/);

			if (!termMatch) {
				console.warn(`⚠ Invalid TERM format: ${row.term}`);
				return null; // Skip invalid rows
			}

			const courseMatch = row.crsenumb.match(/^(\d+)([A-Za-z]*)$/);
			if (!courseMatch) {
				console.warn(`⚠ Invalid COURSE format: ${row.crsenumb}`);
				return null; // Skip invalid rows
			}

			return {
				mnumber: row.mnumber,
				term: termMatch[2],
				year: parseInt(termMatch[1]),
				crn: row.crn,
				course_subject: row.subj,
				course_number: parseInt(courseMatch[1], 10),
				course_suffix: courseMatch[2] || '',
				course_section: row.section,
				override_type: row.override,
				granted_by: row.userid,
				override_date: convertDateDDMMYYYY(row.activitydate)
			};
		}).filter((row: null) => row !== null); // Remove invalid rows

		// Define column types for SQL binding
		const columnTypes = {
			mnumber: 'nvarchar',
			term: 'nvarchar',
			year: 'int',
			crn: 'nvarchar',
			subject: 'nvarchar',
			course_number: 'int',
			course_suffix: 'nvarchar',
			section: 'nvarchar',
			override_type: 'nvarchar',
			granted_by: 'nvarchar',
			override_date: 'datetime'
		};


		const result = await importOverrides(transformedData, fileName, importedBy);
		res.json({
			message: 'Overrides imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing override data: ${error.message}`);
		res.status(500).json({ error: 'Error importing override data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	mnumber: z.string().openapi({ description: 'The MNumber of the student', example: 'M100123456', ref: 'mnumber' }),
	term: z.string().openapi({ description: 'The term code', example: '202310', ref: 'term' }),
	crn: z.string().openapi({ description: 'The CRN of the course', example: '12345', ref: 'crn' }),
	subj: z.string().openapi({ description: 'The course subject', example: 'ACC', ref: 'subj' }),
	crsenumb: z.string().openapi({ description: 'The course number and suffix', example: '099', ref: 'crsenumb' }),
	section: z.string().openapi({ description: 'The course section', example: '03', ref: 'section' }),
	override: z.string().openapi({ description: 'The type of override', example: 'PREREQ', ref: 'override' }),
	userid: z.string().openapi({ description: 'The user ID of the person granting the override', example: 'WWW2_USER', ref: 'userid' }),
	activitydate: z.string().openapi({ description: 'The date the override was granted', example: '01032023', ref: 'activitydate' }),
}));
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'overrides.csv', ref: 'fileName' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'importedBy' });

export const importOverridesSpec = {
	'/api/import/overrides': {
		post: {
			tags: ['Imports'],
			operationId: 'importOverrides',
			description: 'Import override data',
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