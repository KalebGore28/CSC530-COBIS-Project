import express from 'express';
import { importData } from '../../utils/importData';
import { academicStanding } from '../../db/schema';

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

export const academicStandingRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/academic_standing:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import academic standing data.
	 *     description: Imports academic standing data from a CSV file. For each row, if a row with the provided code exists, it is updated; otherwise, a new row is inserted.
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
	 *               fileName:
	 *                 type: string
	 *               importedBy:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Academic standing imported successfully.
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
	 *         description: Error importing academic standing data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/academic_standing', async (req, res) => {
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