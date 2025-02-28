import express from 'express';
import { importData } from '../../utils/importData';
import { studentTypes } from '../../db/models/student_types';

interface StudentTypeRow {
	code: string;
	description: string;
	next_student_type: string;
}

async function importStudentTypes(
	mappedData: StudentTypeRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		studentTypes,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

export const studentTypesRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/student_types:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import student types data.
	 *     description: >
	 *       Imports student types from a CSV file. For each row, if a student type with the provided code exists,
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
	 *                     next_student_type:
	 *                       type: string
	 *               fileName:
	 *                 type: string
	 *               importedBy:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Student types imported successfully.
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
	 *         description: Error importing student type data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/student_types', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;
			const result = await importStudentTypes(mappedData, fileName, importedBy);
			res.json({
				message: 'Student types imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
			/* v8 ignore next 4 */
		} catch (error: any) {
			console.error(`Error importing student type data: ${error.message}`);
			res.status(500).json({ error: 'Error importing student type data.' });
		}
	});