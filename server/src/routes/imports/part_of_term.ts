import express from 'express';
import { importData } from './helpers';
import { partOfTerm } from '../../db/models/part_of_term';

interface PartOfTermRow {
	code: string;
	description: string;
}

async function importPartOfTerm(
	mappedData: PartOfTermRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		partOfTerm,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/part_of_term', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importPartOfTerm(mappedData, fileName, importedBy);
		res.json({
			message: 'Part of term imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing part of term data: ${error.message}`);
		res.status(500).json({ error: 'Error importing part of term data.' });
	}
});

export default router;