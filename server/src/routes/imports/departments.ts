import express, { Request, Response } from 'express';
import { importData } from '../../utils/importData';
import { departments } from '../../db/models/departments';
import 'zod-openapi/extend';
import { z } from 'zod';

interface DepartmentRow {
	code: string;
	description: string;
	prefixes: string;
	canvas_id: string;
	college: string;
}

async function importDepartments(
	mappedData: DepartmentRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		departments,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

/**
 * Import department data
 * @param mappedData - The department data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/departments', async (req: Request, res: Response) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map((row: { prefixes: string; code: string; description: string; canvas_id: string; college: string; }) => {

			return {
				code: row.code,
				description: row.description,
				prefixes: row.prefixes === 'NULL' ? null : row.prefixes.split(',').map((prefix: string) => prefix.trim()).join(','),
				canvas_id: row.canvas_id === 'NULL' ? null : row.canvas_id,
				college: row.college === 'NULL' ? '0' : row.college
			};
		});

		const result = await importDepartments(transformedData, fileName, importedBy);
		res.json({
			message: 'Departments imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing departments data: ${error.message}`);
		res.status(500).json({ error: 'Error importing departments data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	code: z.string().openapi({ description: 'The department code', example: 'ACC', ref: 'departments_code' }),
	description: z.string().openapi({ description: 'The department description', example: 'Accounting', ref: 'departments_description' }),
	prefixes: z.string().openapi({ description: 'The department prefixes', example: 'ACC,BAC', ref: 'departments_prefixes' }),
	canvas_id: z.string().openapi({ description: 'The department Canvas ID', example: '12345', ref: 'departments_canvas_id' }),
	college: z.string().openapi({ description: 'The department college', example: 'BP', ref: 'departments_college' }),
})).openapi({ description: 'The department data to import', ref: 'departments_mapped_data' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'departments.csv', ref: 'departments_filename' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'departments_imported_by' });

export const departmentsSpec = {
	'/api/import/departments': {
		post: {
			tags: ['Imports'],
			operationId: 'import_departments',
			description: 'Import department data',
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