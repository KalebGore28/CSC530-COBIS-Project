import express, { Request, Response } from 'express';
import { importData } from '../../utils/importData';
import { programs } from '../../db/models/programs';
import 'zod-openapi/extend';
import { z } from 'zod';

interface ProgramRow {
	code: string;
	description: string;
	cip_code: string;
	is_major: string;
	is_minor: string;
	has_concentration: string;
	is_discontinued: string;
	is_aacsb: string;
	department: string;
	college: string;
	added_on?: string;
}

async function importPrograms(
	mappedData: ProgramRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		programs,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

/**
 * Import programs data
 * @param mappedData - The programs data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/programs', async (req: Request, res: Response) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map((row: { code: string; description: string; cip_code: string; is_major: string; is_minor: string; has_concentration: string; is_discontinued: string; is_aacsb: string; department: string; college: string; added_on: string; }) => {
			return {
				code: row.code,
				description: row.description,
				cip_code: row.cip_code === 'NULL' ? null : row.cip_code,
				is_major: row.is_major === '1',
				is_minor: row.is_minor === '1',
				has_concentration: row.has_concentration === '1',
				is_discontinued: row.is_discontinued === '1',
				is_aacsb: row.is_aacsb === '1',
				department: row.department === 'NULL' ? '0000' : row.department, // default to '0000' if department is NULL
				college: row.college === 'NULL' ? '0' : row.college, // default to '0' if college is NULL
				added_on: row.added_on === 'NULL' ? new Date().toISOString() : row.added_on // Create date if  not provided
			};
		});

		// Log any transformedData departments that are '0' instead of '0000'
		const zeroDepartments = transformedData.filter((row: any) => row.department === '0');
		if (zeroDepartments.length > 0) {
			console.log('Departments with "0" value:', zeroDepartments);
		}

		const result = await importPrograms(transformedData, fileName, importedBy);
		res.json({
			message: 'Programs imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing programs data: ${error.message}`);
		res.status(500).json({ error: 'Error importing programs data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	code: z.string().openapi({ description: 'The program code', example: 'A005', ref: 'programs_code' }),
	description: z.string().openapi({ description: 'The program description', example: 'Accountancy and Analytics', ref: 'programs_description' }),
	cip_code: z.string().nullable().openapi({ description: 'The CIP code', example: '12345', ref: 'programs_cip_code' }),
	is_major: z.string().openapi({ description: 'Is this a major?', example: '1', ref: 'programs_is_major' }),
	is_minor: z.string().openapi({ description: 'Is this a minor?', example: '0', ref: 'programs_is_minor' }),
	has_concentration: z.string().openapi({ description: 'Has concentration?', example: '0', ref: 'programs_has_concentration' }),
	is_discontinued: z.string().openapi({ description: 'Is this program discontinued?', example: '0', ref: 'programs_is_discontinued' }),
	is_aacsb: z.string().openapi({ description: 'Is this program AACSB accredited?', example: '0', ref: 'programs_is_aacsb' }),
	department: z.string().openapi({ description: 'The department code', example: '0000', ref: 'programs_department_code' }),
	college: z.string().openapi({ description: 'The college code', example: '0', ref: 'programs_college_code' }),
	added_on: z.string().nullable().openapi({ description: 'The date the program was added', example: '2022-01-01', ref: 'programs_added_on' }),
})).openapi({ description: 'The programs data to import', ref: 'programs_mapped_data' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'programs.csv', ref: 'programs_filename' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'programs_imported_by' });

export const importProgramsSpec = {
	'/api/import/programs': {
		post: {
			tags: ['Imports'],
			operationId: 'import_programs',
			description: 'Import programs data',
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
						}
					}
				}
			}
		}
	}
};

export default router;