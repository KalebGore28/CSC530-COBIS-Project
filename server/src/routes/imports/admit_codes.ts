import express from 'express';
import { importData } from '../../utils/importData';
import { admitCodes } from '../../db/schema';

interface AdmitCodeRow {
	code: string;
	description: string;
}

async function importAdmitCodes(
	mappedData: AdmitCodeRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		admitCodes,
		'code',
		mappedData,
		fileName,
		importedBy
	);
}

export const admitCodesRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/admit_codes:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import admit codes data.
	 *     description: >
	 *       Imports admit codes from a CSV file. For each row, if an admit code with the provided code exists,
	 *       it will be updated; otherwise, a new row is inserted.
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
	 *         description: Admit codes imported successfully.
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
	 *         description: Error importing admit codes data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/admit_codes', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;
			const result = await importAdmitCodes(mappedData, fileName, importedBy);
			res.json({
				message: 'Admit codes imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
			/* v8 ignore next 4 */ // This block can only be triggered by a database connection error, which is unlikely to occur in a test environment.
		} catch (error: any) {
			console.error(`Error importing admit codes data: ${error.message}`);
			res.status(500).json({ error: 'Error importing admit codes data.' });
		}
	});