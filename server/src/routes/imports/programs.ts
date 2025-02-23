import express from 'express';
import { importData } from './helpers';
import { programs } from '../../db/models/programs';

interface ProgramRow {
	code: string;
	description: string;
	cip_code: string;
	is_major: string;
	is_minor: string;
	has_concentration: string;
	is_discontinued: string;
	is_aacsb: string;
	department: string;
	college: string;
}

async function importPrograms(
	mappedData: ProgramRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		programs,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/programs', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map((row: { code: string; description: string; cip_code: string; is_major: string; is_minor: string; has_concentration: string; is_discontinued: string; is_aacsb: string; department: string; college: string; }) => {
			return {
				code: row.code,
				description: row.description,
				cip_code: row.cip_code === 'NULL' ? null : row.cip_code,
				is_major: row.is_major === '1',
				is_minor: row.is_minor === '1',
				has_concentration: row.has_concentration === '1',
				is_discontinued: row.is_discontinued === '1',
				is_aacsb: row.is_aacsb === '1',
				department: row.department === 'NULL' ? '0000' : row.department,
				college: row.college === 'NULL' ? '0' : row.college
			};
		});

		const result = await importPrograms(transformedData, fileName, importedBy);
		res.json({
			message: 'Programs imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing programs data: ${error.message}`);
		res.status(500).json({ error: 'Error importing programs data.' });
	}
});

export default router;