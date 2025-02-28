import express from 'express';
import { importData } from '../../utils/importData';
import { instructionalMethods } from '../../db/models/instructional_methods';

interface InstructionalMethodRow {
	code: string;
	description: string;
}

async function importInstructionalMethods(
	mappedData: InstructionalMethodRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		instructionalMethods,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

export const instructionalMethodsRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/instructional_methods:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import instructional methods data.
	 *     description: >
	 *       Imports instructional methods from a CSV file. For each row, if an instructional method with the provided code exists,
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
	 *         description: Instructional methods imported successfully.
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
	 *         description: Error importing instructional methods data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/instructional_methods', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;
			const result = await importInstructionalMethods(mappedData, fileName, importedBy);
			res.json({
				message: 'Instructional methods imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
			/* v8 ignore next 4 */
		} catch (error: any) {
			console.error(`Error importing instructional methods data: ${error.message}`);
			res.status(500).json({ error: 'Error importing instructional methods data.' });
		}
	});