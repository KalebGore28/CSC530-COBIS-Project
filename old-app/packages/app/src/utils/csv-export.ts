import Papa from 'papaparse';

// Utility to safely access nested properties using dot notation
const getNestedValue = (obj: Record<string, any>, path: string): any => {
	return path.split('.').reduce((current, key) => {
		return current && typeof current === 'object' ? current[key] : undefined;
	}, obj);
};

// Utility to flatten nested objects recursively
const flattenObject = (obj: Record<string, any>, prefix: string = '', separator: string = '.'): Record<string, any> => {
	const result: Record<string, any> = {};
	for (const [key, value] of Object.entries(obj)) {
		const newKey = prefix ? `${prefix}${separator}${key}` : key;
		if (value && typeof value === 'object' && !Array.isArray(value)) {
			Object.assign(result, flattenObject(value, newKey, separator));
		} else {
			result[newKey] = value;
		}
	}
	return result;
};

export interface CSVExportOptions<T> {
	/** The filename for the exported CSV (without extension) */
	filename?: string;
	/** Headers to use for the CSV columns (uses object keys if not provided) */
	headers?: string[];
	/** Fields to include in the export (includes all if not provided, supports dot notation for nested fields) */
	fields?: string[];
	/** Lines to insert before the actual CSV table */
	preHeader?: string[];
	/** Optional transformation functions for specific fields */
	fieldTransformers?: { [key: string]: (value: any, item: T) => string };
	/** Separator for nested field flattening (default: '.') */
	nestedFieldSeparator?: string;
}

export const exportToCSV = <T extends Record<string, any>>(
	data: T[],
	options: CSVExportOptions<T> = {}
): void => {
	if (!data?.length) {
		console.warn('No data to export');
		return;
	}

	const {
		filename = 'export',
		headers,
		fields,
		preHeader,
		fieldTransformers = {},
		nestedFieldSeparator = '.',
	} = options;

	// 1) Preprocess data: flatten nested objects and apply transformations
	const processedData = data.map(item => {
		// Flatten the item if nested fields are involved
		const flattenedItem = fields?.some(field => field.includes(nestedFieldSeparator))
			? flattenObject(item, '', nestedFieldSeparator)
			: { ...item };

		// Filter fields if specified
		const filtered: Record<string, any> = {};
		const targetFields = fields || Object.keys(flattenedItem);

		targetFields.forEach(field => {
			let value = flattenedItem[field] ?? getNestedValue(item, field);

			// Apply transformer if available
			const transformer = fieldTransformers[field] || fieldTransformers[field.split(nestedFieldSeparator)[0]];
			if (transformer) {
				value = transformer(value, item);
			} else if (value != null) {
				// Default handling for arrays and objects
				if (Array.isArray(value)) {
					value = value.join(', ');
				} else if (typeof value === 'object') {
					value = JSON.stringify(value);
				}
			}

			filtered[field] = value ?? '';
		});

		return filtered;
	});

	// 2) Generate headers if not provided
	const csvHeaders = headers || fields || Object.keys(processedData[0]);

	// 3) Generate the core CSV
	const coreCsv = Papa.unparse({
		fields: csvHeaders,
		data: processedData,
	});

	// 4) Stitch preHeader (if any) above it
	const csv = preHeader && preHeader.length
		? preHeader.join('\n') + '\n\n' + coreCsv
		: coreCsv;

	// 5) Download it
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