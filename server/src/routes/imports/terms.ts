import express from 'express';
import { importData } from './helpers';
import { terms } from '../../db/models/terms';

interface TermRow {
	code: string;
	description: string;
}

async function importTerms(
	mappedData: TermRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		terms,
		['code'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/terms', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importTerms(mappedData, fileName, importedBy);
		res.json({
			message: 'Terms imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing terms data: ${error.message}`);
		res.status(500).json({ error: 'Error importing terms data.' });
	}
});

export default router;