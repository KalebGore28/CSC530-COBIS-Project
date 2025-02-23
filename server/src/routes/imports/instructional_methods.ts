import express from 'express';
import { importData } from './helpers';
import { instructionalMethods } from '../../db/models/instructional_methods';

interface InstructionalMethodRow {
	code: string;
	description: string;
}

async function importInstructionalMethods(
	mappedData: InstructionalMethodRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		instructionalMethods,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/instructional_methods', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importInstructionalMethods(mappedData, fileName, importedBy);
		res.json({
			message: 'Instructional methods imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing instructional methods data: ${error.message}`);
		res.status(500).json({ error: 'Error importing instructional methods data.' });
	}
});

export default router;