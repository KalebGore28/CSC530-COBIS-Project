// utils/csv-export.ts
import Papa from 'papaparse';

export interface CSVExportOptions {
	/** The filename for the exported CSV (without extension) */
	filename?: string;
	/** Headers to use for the CSV columns (uses object keys if not provided) */
	headers?: string[];
	/** Fields to include in the export (includes all if not provided) */
	fields?: string[];
	/** Lines to insert before the actual CSV table */
	preHeader?: string[];
}

export const exportToCSV = <T extends Record<string, any>>(
	data: T[],
	options: CSVExportOptions = {}
): void => {
	if (!data?.length) {
		console.warn('No data to export');
		return;
	}

	const { filename = 'export', headers, fields, preHeader } = options;

	// 1) filter fields if needed
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

	// 2) generate the core CSV
	const coreCsv = Papa.unparse({
		fields: headers || Object.keys(processedData[0]),
		data: processedData,
	});

	// 3) stitch preHeader (if any) above it
	const csv = preHeader && preHeader.length
		? preHeader.join('\n') + '\n\n' + coreCsv
		: coreCsv;

	// 4) download it
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `${filename}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};
