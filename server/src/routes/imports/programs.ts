import express from 'express';
import { importData } from '../../utils/importData';
import { programs } from '../../db/models/programs';

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

export const programsRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/programs:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import programs data.
	 *     description: >
	 *       Imports program data from a CSV file. The CSV data is transformed to match the database schema:
	 *       - "cip_code" is set to null if the value is 'NULL'.
	 *       - Boolean flags ("is_major", "is_minor", "has_concentration", "is_discontinued", "is_aacsb") are converted from '1' to true.
	 *       - "department" defaults to '0000' and "college" defaults to '0' when the CSV value is 'NULL'.
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
	 *                     cip_code:
	 *                       type: string
	 *                     is_major:
	 *                       type: string
	 *                     is_minor:
	 *                       type: string
	 *                     has_concentration:
	 *                       type: string
	 *                     is_discontinued:
	 *                       type: string
	 *                     is_aacsb:
	 *                       type: string
	 *                     department:
	 *                       type: string
	 *                     college:
	 *                       type: string
	 *               fileName:
	 *                 type: string
	 *               importedBy:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Programs imported successfully.
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
	 *         description: Error importing programs data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/programs', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;

			// Transform the CSV data to match the database schema
			const transformedData = mappedData.map((row: { code: string; description: string; cip_code: string; is_major: string; is_minor: string; has_concentration: string; is_discontinued: string; is_aacsb: string; department: string; college: string; }) => {
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
					college: row.college === 'NULL' ? '0' : row.college // default to '0' if college is NULL
				};
			});

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