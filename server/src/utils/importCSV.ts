import fs from 'fs';
import csvParser from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads a CSV file and returns a Promise that resolves to an array of objects.
 * Optionally transforms each row using the provided transform function.
 * 
 * @param csvFilePath - Path to the CSV file.
 * @param transformFn - (Optional) A function to transform each row to the desired format.
 * @returns Promise resolving to the mapped data array.
 */
export async function importCSV<T = Record<string, any>>(
	csvFilePath: string,
	transformFn?: (row: any) => T
): Promise<T[]> {
	return new Promise((resolve, reject) => {
		const results: T[] = [];

		// Get absolute path to the CSV file
		console.log(path.resolve(__dirname, csvFilePath));

		fs.createReadStream(path.resolve(__dirname, csvFilePath))
			.pipe(csvParser())
			.on('data', (data) => {
				let row = transformFn ? transformFn(data) : data;

				// Normalize the row: trim whitespace from both keys and values
				row = Object.keys(row).reduce((acc, key) => {
					const normalizedKey = key.trim().toLowerCase(); // trim and lowercase the key
					const value = row[key];
					acc[normalizedKey] = typeof value === 'string' ? value.trim() : value; // trim strings
					return acc;
				}, {} as Record<string, any>);
				results.push(row);
			})
			.on('end', () => resolve(results))
			.on('error', (error) => reject(error));
	});
}