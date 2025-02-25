import express from 'express';
import { importData, convertDateDDMMYYYY } from './helpers';
import { previousColleges } from '../../db/models/previous_colleges';

interface PreviousCollegeRow {
	mnumber: string;
	collegecode: string;
	collegedesc: string;
	degree: string;
	degreedate: string;
}

async function importPreviousColleges(
	mappedData: PreviousCollegeRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		previousColleges,
		['mnumber', 'college_code'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router()

	/**
	 * @openapi
	 * /api/import/previous_colleges:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import previous colleges data.
	 *     description: >
	 *       Imports previous college data from a CSV file. The CSV data is transformed to match the database schema:
	 *       - "collegecode" is mapped to "college_code".
	 *       - "collegedesc" is mapped to "college_description".
	 *       - "degreedate" is converted using a DD-MM-YYYY format converter.
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
	 *                     mnumber:
	 *                       type: string
	 *                     collegecode:
	 *                       type: string
	 *                     collegedesc:
	 *                       type: string
	 *                     degree:
	 *                       type: string
	 *                     degreedate:
	 *                       type: string
	 *                       description: Date in DD-MM-YYYY format.
	 *               fileName:
	 *                 type: string
	 *               importedBy:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Previous colleges imported successfully.
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
	 *         description: Error importing previous colleges data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/previous_colleges', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;

			// Transform the CSV data to match the database schema
			const transformedData = mappedData.map((row: { mnumber: string; collegecode: string; collegedesc: string; degree: string; degreedate: string; }) => {
				return {
					mnumber: row.mnumber,
					college_code: row.collegecode,
					college_description: row.collegedesc,
					degree: row.degree,
					date: convertDateDDMMYYYY(row.degreedate),
				};
			});

			const result = await importPreviousColleges(transformedData, fileName, importedBy);
			res.json({
				message: 'Registration status imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
		} catch (error: any) {
			console.error(`Error importing registration status data: ${error.message}`);
			res.status(500).json({ error: 'Error importing registration status data.' });
		}
	});

export default router;