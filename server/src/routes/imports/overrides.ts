import express from 'express';
import { importData, convertDateDDMMYYYY } from './helpers';
import { overrides } from '../../db/models/overrides';

interface OverrideRow {
	mnumber: string;
	term: string;
	crn: string;
	subj: string;
	crsenumb: string;
	section: string;
	override: string;
	userid: string;
	activitydate: string;
}

async function importOverrides(
	mappedData: OverrideRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		overrides,
		['mnumber', 'term', 'year', 'crn'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/overrides', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map((row: { term: string; crsenumb: string; mnumber: string; crn: string; subj: string; section: string; override: string; userid: string; activitydate: string; }) => {

			const termMatch = row.term.match(/^(\d{4})(\d{2})$/);

			if (!termMatch) {
				console.warn(`⚠ Invalid TERM format: ${row.term}`);
				return null; // Skip invalid rows
			}

			const courseMatch = row.crsenumb.match(/^(\d+)([A-Za-z]*)$/);

			if (!courseMatch) {
				console.warn(`⚠ Invalid COURSE format: ${row.crsenumb}`);
				return null; // Skip invalid rows
			}

			return {
				mnumber: row.mnumber,
				term: termMatch[2],
				year: parseInt(termMatch[1]),
				crn: row.crn,
				course_subject: row.subj,
				course_number: parseInt(courseMatch[1], 10),
				course_suffix: courseMatch[2] || '',
				course_section: row.section,
				override_type: row.override,
				granted_by: row.userid,
				override_date: convertDateDDMMYYYY(row.activitydate)
			};
		}).filter((row: null) => row !== null); // Remove invalid rows

		// Define column types for SQL binding
		const columnTypes = {
			mnumber: 'nvarchar',
			term: 'nvarchar',
			year: 'int',
			crn: 'nvarchar',
			subject: 'nvarchar',
			course_number: 'int',
			course_suffix: 'nvarchar',
			section: 'nvarchar',
			override_type: 'nvarchar',
			granted_by: 'nvarchar',
			override_date: 'datetime'
		};


		const result = await importOverrides(transformedData, fileName, importedBy);
		res.json({
			message: 'Overrides imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing override data: ${error.message}`);
		res.status(500).json({ error: 'Error importing override data.' });
	}
});

export default router;