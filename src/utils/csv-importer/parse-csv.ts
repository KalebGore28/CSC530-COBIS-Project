import Papa from "papaparse";

/**
 * Parses CSV content using PapaParse and returns a promise with the results.
 * @param fileContent - The CSV file content as a string
 * @returns A promise that resolves to the parsed CSV data
 */
export function parseCSV(fileContent: string): Promise<Papa.ParseResult<Record<string, string>>> {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results as Papa.ParseResult<Record<string, string>>),
      error: (e: any) => reject(e),
    });
  });
}
