import express from 'express';
import { importData } from '../../utils/importData';
import { departments } from '../../db/models/departments';

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

export const departmentsRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/departments:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import departments data.
	 *     description: >
	 *       Imports department data from a CSV file. The CSV data is transformed to match the database schema:
	 *       - The "prefixes" field is split by commas, trimmed, and rejoined.
	 *       - "NULL" strings are converted to null or a default value as appropriate.
	 *       - "canvas_id" is set to null if missing.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               mappedData:
	 *                 type: array
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     code:
	 *                       type: string
	 *                     description:
	 *                       type: string
	 *                     prefixes:
	 *                       type: string
	 *                       description: Comma-separated list of prefixes.
	 *                     canvas_id:
	 *                       type: string
	 *                     college:
	 *                       type: string
	 *               fileName:
	 *                 type: string
	 *               importedBy:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Departments imported successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 message:
	 *                   type: string
	 *                 totalRecords:
	 *                   type: integer
	 *                 errors:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       row:
	 *                         type: object
	 *                       error:
	 *                         type: string
	 *       500:
	 *         description: Error importing departments data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/departments', async (req, res) => {
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