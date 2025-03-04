import express from 'express';
import { importData } from '../../utils/importData';
import { subjectPrefixes } from '../../db/models/subject_prefixes';

interface SubjectPrefixRow {
	college: string;
	department: string;
	prefix: string;
}

async function importSubjectPrefixes(
	mappedData: SubjectPrefixRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		subjectPrefixes,
		['college', 'department', 'prefix'],
		mappedData,
		fileName,
		importedBy
	);
}

export const subjectPrefixesRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/subject_prefixes:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import subject prefixes data.
	 *     description: >
	 *       Imports subject prefixes from a CSV file. Each row must include a college, department, and prefix.
	 *       For each row, if an entry with the provided college, department, and prefix exists, it is updated;
	 *       otherwise, a new row is inserted.
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
	 *                     college:
	 *                       type: string
	 *                     department:
	 *                       type: string
	 *                     prefix:
	 *                       type: string
	 *               fileName:
	 *                 type: string
	 *               importedBy:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Subject prefixes imported successfully.
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
	 *         description: Error importing subject prefixes data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/subject_prefixes', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;

			// Transform the CSV data to match the database schema
			const transformedData = mappedData.map((row: { college: string; department: string; prefix: string; }) => {
				return {
					college: row.college,
					department: row.department,
					prefix: row.prefix,
				};
			});

			const result = await importSubjectPrefixes(transformedData, fileName, importedBy);
			res.json({
				message: 'Course prefixes imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
			/* v8 ignore next 4 */
		} catch (error: any) {
			console.error(`Error importing course prefixes data: ${error.message}`);
			res.status(500).json({ error: 'Error importing course prefixes data.' });
		}
	});