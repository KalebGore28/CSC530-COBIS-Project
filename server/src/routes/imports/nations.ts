import express from 'express';
import { importData } from '../../utils/importData';
import { nations } from '../../db/models/nations';

interface NationRow {
	code: string;
	description: string;
}

async function importNations(
	mappedData: NationRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		nations,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

export const nationsRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/nations:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import nations data.
	 *     description: >
	 *       Imports nation data from a CSV file. For each row, if a nation with the provided code exists,
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
	 *         description: Nations imported successfully.
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
	 *         description: Error importing nations data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/nations', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;
			const result = await importNations(mappedData, fileName, importedBy);
			res.json({
				message: 'Nations imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
			/* v8 ignore next 4 */
		} catch (error: any) {
			console.error(`Error importing nations data: ${error.message}`);
			res.status(500).json({ error: 'Error importing nations data.' });
		}
	});