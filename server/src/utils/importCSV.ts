import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
	console.log(csvFilePath);
	return new Promise((resolve, reject) => {
		const results: Record<string, any>[] = [];

		fs.createReadStream(csvFilePath)
			.pipe(csvParser({
				mapHeaders: ({ header }) => header.trim().toLowerCase(), // Trim and lowercase headers
				mapValues: ({ value }) => {
					if (typeof value === 'string') {
						const trimmed = value.trim();
						return trimmed === 'NULL' ? null : trimmed; // Convert 'NULL' to null
					}
					return value;
				},
			}))
			.on('data', (data) => results.push(data))
			.on('end', () => resolve(results))
			.on('error', (error) => reject(error));
	});
}

// // Step 1: Get the current module's file path
// const __filename = fileURLToPath(import.meta.url);

// // Step 2: Get the current module's directory path (equivalent to __dirname)
// const __dirname = path.dirname(__filename);

// // Step 3: Construct the absolute path to your file (e.g., 'file.csv')
// const filePath = path.join(__dirname, '../seed/data/csvs/test_scores_sample.csv');
// // test
// importCSV(filePath).then((data) => {
// 	// only return rows that do not have a web_fee
// 	const filteredData = data.filter((row) => !row.web_fee);
// 	console.log(filteredData);
// });