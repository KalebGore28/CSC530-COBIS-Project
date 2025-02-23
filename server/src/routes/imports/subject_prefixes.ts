import express from 'express';
import { importData } from './helpers';
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

const router = express.Router();

router.post('/subject_prefixes', async (req, res) => {
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
	} catch (error: any) {
		console.error(`Error importing course prefixes data: ${error.message}`);
		res.status(500).json({ error: 'Error importing course prefixes data.' });
	}
});

export default router;