import express from 'express';
import { importData } from './helpers';
import { studentTypes } from '../../db/models/student_types';

interface StudentTypeRow {
	code: string;
	description: string;
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

const router = express.Router();

router.post('/student_types', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;
		const result = await importStudentTypes(mappedData, fileName, importedBy);
		res.json({
			message: 'Student types imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing student type data: ${error.message}`);
		res.status(500).json({ error: 'Error importing student type data.' });
	}
});

export default router;