import express from 'express';
import { importData } from '../../utils/importData';
import { partOfTerm } from '../../db/models/part_of_term';

interface PartOfTermRow {
	code: string;
	description: string;
}

async function importPartOfTerm(
	mappedData: PartOfTermRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		partOfTerm,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

export const partOfTermRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/part_of_term:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import part of term data.
	 *     description: >
	 *       Imports part of term data from a CSV file. For each row, if a part of term with the provided code exists,
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
	 *         description: Part of term imported successfully.
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
	 *         description: Error importing part of term data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/part_of_term', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;
			const result = await importPartOfTerm(mappedData, fileName, importedBy);
			res.json({
				message: 'Part of term imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
			/* v8 ignore next 4 */
		} catch (error: any) {
			console.error(`Error importing part of term data: ${error.message}`);
			res.status(500).json({ error: 'Error importing part of term data.' });
		}
	});