import express from 'express';
import { importData } from './helpers';
import { departments } from '../../db/models/departments';

interface DepartmentRow {
	code: string;
	description: string;
	prefixes: string;
	canvas_id: string;
	college: string;
}

async function importDepartments(
	mappedData: DepartmentRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		departments,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/departments', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map((row: { prefixes: string; code: string; description: string; canvas_id: string; college: string; }) => {

			// Split the prefixes into an array
			const prefixes = row.prefixes.split(',').map((p: string) => p.trim()).filter((p: string | any[]) => p.length > 0);

			return {
				code: row.code,
				description: row.description,
				prefixes: row.prefixes === 'NULL' ? null : prefixes.join(','),
				canvas_id: row.canvas_id || null,
				college: row.college === 'NULL' ? "0" : row.college
			};
		});

		const result = await importDepartments(transformedData, fileName, importedBy);
		res.json({
			message: 'Departments imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing departments data: ${error.message}`);
		res.status(500).json({ error: 'Error importing departments data.' });
	}
});

export default router;