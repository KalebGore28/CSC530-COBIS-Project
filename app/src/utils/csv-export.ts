import Papa from 'papaparse';

/**
 * Options for exporting data to CSV
 */
export interface CSVExportOptions {
	/** The filename for the exported CSV (without extension) */
	filename?: string;
	/** Headers to use for the CSV columns (uses object keys if not provided) */
	headers?: string[];
	/** Fields to include in the export (includes all if not provided) */
	fields?: string[];
}

/**
 * Exports data to a CSV file and triggers a download
 * 
 * @param data Array of objects to export as CSV
 * @param options Export options
 */
export const exportToCSV = <T extends Record<string, any>>(
	data: T[],
	options: CSVExportOptions = {}
): void => {
	if (!data || data.length === 0) {
		console.warn('No data to export');
		return;
	}

	const { filename = 'export', headers, fields } = options;

	// If specific fields are provided, filter the data
	const processedData = fields
		? data.map(item => {
			const filtered: Record<string, any> = {};
			fields.forEach(field => {
				if (field in item) {
					filtered[field] = item[field];
				}
			});
			return filtered;
		})
		: data;

	// Convert to CSV using PapaParse
	const csv = Papa.unparse({
		fields: headers || (fields || Object.keys(processedData[0])),
		data: processedData
	});

	// Create a Blob and download link
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.setAttribute('href', url);
	link.setAttribute('download', `${filename}.csv`);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

/**
 * Format student data for roster export
 * 
 * @param students Array of student objects
 * @returns Formatted array ready for CSV export
 */
export const formatRosterForExport = (students: any[]) => {
	return students.map(student => ({
		'Last Name': student.lastName,
		'First Name': student.firstName,
		'Middle Initial': student.middleName ? student.middleName.charAt(0) : '',
		'Suffix': student.suffix || '',
		'M-Number': student.mnumber,
		'Email': student.email,
		'Major': student.major,
		'Midterm Grade': student.midtermGrade,
		'Final Grade': student.finalGrade,
		'Status': student.registrationStatus,
		'Method': student.instructionalMethod,
		'GPA': student.overallGpa.toFixed(2),
		'Earned Hours': student.overallEarnedHours
	}));
};