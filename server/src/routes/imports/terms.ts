import express from 'express';
import { importData } from '../../utils/importData';
import { terms } from '../../db/models/terms';

interface TermRow {
	code: string;
	description: string;
}

async function importTerms(
	mappedData: TermRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		terms,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router()

	/**
	 * @openapi
	 * /api/import/terms:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import terms data.
	 *     description: >
	 *       Imports term data from a CSV file. Each term must include a code and a description.
	 *       For each row, if a term with the provided code exists, it is updated; otherwise, a new row is inserted.
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
	 *         description: Terms imported successfully.
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
	 *         description: Error importing terms data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/terms', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;
			const result = await importTerms(mappedData, fileName, importedBy);
			res.json({
				message: 'Terms imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
		} catch (error: any) {
			console.error(`Error importing terms data: ${error.message}`);
			res.status(500).json({ error: 'Error importing terms data.' });
		}
	});

export default router;