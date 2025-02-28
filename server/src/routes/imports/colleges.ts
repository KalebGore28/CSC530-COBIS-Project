import express from 'express';
import { importData } from '../../utils/importData';
import { colleges } from '../../db/schema';

interface CollegeRow {
	code: string;
	description: string;
}

export async function importColleges(
	mappedData: CollegeRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		colleges,
		'code',
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router()

	/**
	 * @openapi
	 * /api/import/colleges:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import colleges data.
	 *     description: >
	 *       Imports colleges from a CSV file. For each row, if a college with the provided code exists,
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
	 *         description: Colleges imported successfully.
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
	 *         description: Error importing colleges data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/colleges', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;
			const result = await importColleges(mappedData, fileName, importedBy);
			res.json({
				message: 'Colleges imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
		} catch (error: any) {
			console.error(`Error importing colleges data: ${error.message}`);
			res.status(500).json({ error: 'Error importing colleges data.' });
		}
	});

export default router;