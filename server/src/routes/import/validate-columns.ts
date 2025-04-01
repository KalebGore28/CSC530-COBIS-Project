import express, { Request, Response } from 'express';
import { getDestinationByTableId } from '../../services/columnMappingService';

const router = express.Router();

interface ValidateColumnsRequest {
	tableId: string;
	csvHeaders: string[];
}

/**
 * Validate CSV headers against expected columns for a table
 * @route POST /api/import/validate-columns
 * @group Imports - CSV data import operations
 * @param {string} tableId.body.required - ID of the table to validate against
 * @param {array} csvHeaders.body.required - Array of CSV column headers
 * @returns {object} 200 - Validation results with mapping suggestions
 * @returns {Error} 400 - Missing parameters or table not found
 * @returns {Error} 500 - Server error
 */
router.post('/validate-columns', async (req: Request, res: Response) => {
	try {
		const { tableId, csvHeaders } = req.body as ValidateColumnsRequest;

		if (!tableId || !csvHeaders || !Array.isArray(csvHeaders)) {
			res.status(400).json({
				error: 'Missing required parameters',
				message: 'Both tableId and csvHeaders array are required'
			});
			return;
		}

		// Get the destination table configuration
		const table = getDestinationByTableId(tableId);
		if (!table) {
			res.status(400).json({
				error: 'Table not found',
				message: `No table found with ID: ${tableId}`
			});
			return;
		}

		// Convert CSV headers to lowercase for case-insensitive comparison
		const normalizedCsvHeaders = csvHeaders.map(h => h.toLowerCase().trim());

		// Get expected columns from table configuration
		const expectedColumns = table.columnMappings.map(col => ({
			dbColumn: col.dbColumn,
			csvColumn: col.csvColumn,
			isPrimaryKey: table.primaryKeys.includes(col.dbColumn),
			hasTransform: !!col.transform
		}));

		// Check for exact matches first (CSV header matches the expected column name exactly)
		const exactMatches: Record<string, string> = {};
		const unmatchedColumns = [];

		for (const column of expectedColumns) {
			const exactMatch = normalizedCsvHeaders.includes(column.csvColumn.toLowerCase().trim());

			if (exactMatch) {
				exactMatches[column.dbColumn] = column.csvColumn;
			} else {
				unmatchedColumns.push(column);
			}
		}

		// Check for possible matches based on similarity for unmatched columns
		const suggestedMatches: Record<string, { csvColumn: string; similarity: number }> = {};
		const requiredColumns = [];

		for (const column of unmatchedColumns) {
			// Try to find a similar column name in the CSV
			const possibleMatches = normalizedCsvHeaders
				.map(header => ({
					header,
					similarity: calculateSimilarity(header, column.csvColumn.toLowerCase().trim())
				}))
				.filter(match => match.similarity > 0.6) // Threshold for similarity
				.sort((a, b) => b.similarity - a.similarity);

			if (possibleMatches.length > 0) {
				// Suggest the most similar match
				suggestedMatches[column.dbColumn] = {
					csvColumn: csvHeaders[normalizedCsvHeaders.indexOf(possibleMatches[0].header)],
					similarity: possibleMatches[0].similarity
				};
			}

			// If this is a primary key, it's required
			if (column.isPrimaryKey) {
				requiredColumns.push(column.dbColumn);
			}
		}

		// Identify missing required columns (primary keys)
		const missingRequiredColumns = requiredColumns.filter(col =>
			!exactMatches[col] && !suggestedMatches[col]
		);

		// Check if all required columns are present (exact or suggested)
		const isValid = missingRequiredColumns.length === 0;

		// Create a final suggested mapping combining exact and suggested matches
		const suggestedMapping = { ...exactMatches };

		// Add suggested matches to the mapping
		for (const [dbColumn, match] of Object.entries(suggestedMatches)) {
			suggestedMapping[dbColumn] = match.csvColumn;
		}

		res.json({
			isValid,
			tableId,
			tableName: table.tableName,
			exactMatches,
			suggestedMatches,
			unmatchedColumns: unmatchedColumns.map(col => col.dbColumn),
			missingRequiredColumns,
			expectedColumns,
			csvHeaders,
			suggestedMapping
		});

	} catch (error: any) {
		console.error('Error validating columns:', error);
		res.status(500).json({
			error: 'Error validating columns',
			message: error.message
		});
	}
});

/**
 * Calculate string similarity between two strings
 * Using simple Levenshtein distance algorithm
 */
function calculateSimilarity(str1: string, str2: string): number {
	if (str1.length === 0) return str2.length === 0 ? 1 : 0;
	if (str2.length === 0) return 0;

	const matrix = [];

	// Initialize the matrix
	for (let i = 0; i <= str1.length; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= str2.length; j++) {
		matrix[0][j] = j;
	}

	// Fill the matrix
	for (let i = 1; i <= str1.length; i++) {
		for (let j = 1; j <= str2.length; j++) {
			if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1, // substitution
					matrix[i][j - 1] + 1,     // insertion
					matrix[i - 1][j] + 1      // deletion
				);
			}
		}
	}

	// Calculate similarity as 1 - (distance / max length)
	const distance = matrix[str1.length][str2.length];
	const maxLength = Math.max(str1.length, str2.length);

	return 1 - (distance / maxLength);
}

export default router;