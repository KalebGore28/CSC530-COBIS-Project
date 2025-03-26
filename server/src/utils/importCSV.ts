import fs from 'fs';
import csvParser from 'csv-parser';

/**
 * Reads a CSV file and returns a Promise that resolves to an array of objects.
 * Trims whitespace from headers and values, and optionally transforms each row.
 *
 * @param csvFilePath - Path to the CSV file.
 * @param transformFn - (Optional) Function to transform each row to the desired format.
 * @returns Promise resolving to the mapped data array.
 */
export async function importCSV(csvFilePath: string): Promise<Record<string, any>[]> {
	return new Promise((resolve, reject) => {
		const results: Record<string, any>[] = [];

		fs.createReadStream(csvFilePath)
			.pipe(csvParser({
				mapHeaders: ({ header }) => header.trim().toLowerCase(), // Trim and lowercase headers
				mapValues: ({ value }) => {
					if (typeof value === 'string') {
						const trimmed = value.trim();
						return trimmed;
					}
					return value;
				},
			}))
			.on('data', (data) => results.push(data))
			.on('end', () => resolve(results))
			.on('error', (error) => reject(error));
	});
}