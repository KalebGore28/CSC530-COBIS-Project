import express from 'express';
import { importData } from '../../utils/importData';
import { registrationStatus } from '../../db/models/registration_status';

interface RegistrationStatusRow {
	code: string;
	description: string;
}

async function importRegistrationStatus(
	mappedData: RegistrationStatusRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		registrationStatus,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

export const registrationStatusRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/registration_status:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import registration status data.
	 *     description: >
	 *       Imports registration status data from a CSV file. For each row, if a registration status with the provided code exists,
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
	 *         description: Registration status imported successfully.
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
	 *         description: Error importing registration status data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/registration_status', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;
			const result = await importRegistrationStatus(mappedData, fileName, importedBy);
			res.json({
				message: 'Registration status imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
			/* v8 ignore next 4 */
		} catch (error: any) {
			console.error(`Error importing registration status data: ${error.message}`);
			res.status(500).json({ error: 'Error importing registration status data.' });
		}
	});