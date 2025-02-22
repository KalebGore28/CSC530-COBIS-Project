import express from 'express';
// import { importData } from './helpers.js';
import { db } from '../../db/connection';
import { eq } from "drizzle-orm";
import { academicStanding } from '../../db/models/academic_standing';


interface AcademicStandingRow {
	code: string;
	description: string;
}

/**
 * Imports academic standing data.
 * For each row in mappedData, if a row with the given code exists, update it; otherwise, insert a new row.
 *
 * @param mappedData - Array of academic standing rows (each having code and description).
 * @param fileName - The name of the CSV file (for logging, if needed).
 * @param importedBy - Identifier for who performed the import.
 * @returns An object with the total records processed and any errors encountered.
 */
export async function importAcademicStanding(
	mappedData: AcademicStandingRow[],
	fileName: string,
	importedBy: string
) {
	if (!Array.isArray(mappedData) || mappedData.length === 0) {
		throw new Error("Invalid CSV data.");
	}

	const totalRecords = mappedData.length;
	const errorDetails: Array<{ row: AcademicStandingRow; error: string }> = [];

	for (const row of mappedData) {
		try {
			// Check if a row with the given code exists.
			const existingRows = await db
				.select()
				.from(academicStanding)
				.where(eq(academicStanding.code, row.code))
				.limit(1);

			if (existingRows.length > 0) {
				// Update the existing row.
				await db
					.update(academicStanding)
					.set({ description: row.description })
					.where(eq(academicStanding.code, row.code));
			} else {
				// Insert a new row.
				await db.insert(academicStanding).values({
					code: row.code,
					description: row.description,
				});
			}
		} catch (error: any) {
			errorDetails.push({ row, error: error.message });
			console.error(`Error processing row with code ${row.code}: ${error.message}`);
		}
	}

	// Optionally, you can add logging for the import operation here.

	return { totalRecords, errorDetails };
}

const router = express.Router();

router.post('/academic_standing', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;
    const result = await importAcademicStanding(mappedData, fileName, importedBy);
    res.json({
      message: 'Academic standing imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails,
    });
  } catch (error: any) {
    console.error(`Error importing academic standing data: ${error.message}`);
    res.status(500).json({ error: 'Error importing academic standing data.' });
  }
});

export default router;