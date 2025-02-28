import express from 'express';
import { importData } from '../../utils/importData';
import { collegeCodes } from '../../db/schema';

interface CollegeCodeRow {
	code: string;
	description: string;
}

async function importCollegeCodes(
	mappedData: CollegeCodeRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		collegeCodes,
		'code',
		mappedData,
		fileName,
		importedBy
	);
}

export const collegeCodesRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/college_codes:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import college codes data.
	 *     description: >
	 *       Imports college codes from a CSV file. For each row, if a college code with the provided code exists,
	 *       it is updated; otherwise, a new row is inserted.
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
	 *         description: College codes imported successfully.
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
	 *         description: Error importing college codes data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/college_codes', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;
			const result = await importCollegeCodes(mappedData, fileName, importedBy);
			res.json({
				message: 'College codes imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
			/* v8 ignore next 4 */
		} catch (error: any) {
			console.error(`Error importing college codes data: ${error.message}`);
			res.status(500).json({ error: 'Error importing college codes data.' });
		}
	});