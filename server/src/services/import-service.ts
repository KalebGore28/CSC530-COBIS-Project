import * as schema from '../db/schema';
import { importData } from '../utils/importData';
import { importCSV } from '../utils/importCSV';
import {
	findMappingsForFilename,
	findMappingsForLookupTable,
	mapCsvDataToDbData,
	csvFileMappings,
	getAllDestinationTables
} from '../services/column-mapping-service';

/**
 * Service for handling data import operations
 */
export class ImportService {
	/**
	 * Process and import a CSV file
	 * @param filePath Path to the uploaded CSV file
	 * @param fileName Original name of the uploaded file
	 * @param importedBy User who imported the file
	 * @param tableId Optional tableId for lookup tables
	 * @returns Import results
	 */
	static async processImport(
		filePath: string,
		fileName: string,
		importedBy: string,
		tableId?: string
	) {
		// Parse the CSV file
		const csvData = await importCSV(filePath);

		if (!csvData || csvData.length === 0) {
			throw new Error('Empty or invalid CSV file');
		}

		// Get CSV headers
		const headers = Object.keys(csvData[0]);

		// Try to find mapping by filename (for data tables)
		let fileMapping = findMappingsForFilename(fileName);
		let category = 'data';

		// If not found and tableId is provided, try to find mapping for lookup table
		if (!fileMapping && tableId) {
			fileMapping = findMappingsForLookupTable(tableId);
			category = 'lookup';
		}

		// If still no mapping found
		if (!fileMapping) {
			throw new Error('No mapping found for this file');
		}

		// Process each destination
		const results = [];
		const errors = [];

		for (const destination of fileMapping.destinations) {
			// For lookup tables, only process the requested table
			if (category === 'lookup' && tableId && destination.tableId !== tableId) {
				continue;
			}

			try {
				// Map CSV data to DB format (handles row expansion automatically)
				const mappedData = mapCsvDataToDbData(csvData, destination);

				if (mappedData.length === 0) {
					results.push({
						tableName: destination.tableName,
						tableId: destination.tableId,
						success: true,
						message: 'No relevant data found for this table',
						totalRecords: 0,
						inserted: 0,
						updated: 0,
						skipped: 0,
						failed: 0
					});
					continue;
				}

				// Get the schema reference and primary keys
				const tableSchema = destination.schemaRef || this.getSchemaReference(destination.tableId);

				if (!tableSchema) {
					throw new Error(`Schema not found for table: ${destination.tableName}`);
				}

				// Import the data
				const importResult = await importData(
					tableSchema,
					destination.primaryKeys,
					mappedData,
					fileName,
					importedBy
				);

				results.push({
					tableName: destination.tableName,
					tableId: destination.tableId,
					success: importResult.failed === 0,
					message: `Processed ${importResult.totalRecords} records`,
					totalRecords: importResult.totalRecords,
					inserted: importResult.inserted,
					updated: importResult.updated,
					skipped: importResult.skipped,
					failed: importResult.failed,
					errorDetails: importResult.errorDetails.length > 0
						? importResult.errorDetails.map(e => e.error)
						: undefined
				});
			} catch (error: any) {
				console.error(`Error importing to ${destination.tableName}:`, error);
				errors.push(`Error importing to ${destination.tableName}: ${error.message}`);

				results.push({
					tableName: destination.tableName,
					tableId: destination.tableId,
					success: false,
					message: error.message,
					totalRecords: 0,
					inserted: 0,
					updated: 0,
					skipped: 0,
					failed: 0
				});
			}
		}

		// Return the results
		return {
			fileName,
			category,
			mappingDescription: fileMapping.description,
			results,
			errors: errors.length > 0 ? errors : undefined,
			success: results.some(r => r.success),
			timestamp: new Date().toISOString()
		};
	}

	/**
	 * Get all import information including tables and file patterns
	 * @returns Comprehensive import information
	 */
	static getImportInfo() {
		// Get all destination tables
		const allTables = getAllDestinationTables();

		// Transform into the new simplified format
		const tables = allTables.map(table => {
			// Find the parent mapping to determine which file patterns can map to this table
			const parentMappings = csvFileMappings.filter(mapping =>
				mapping.destinations.some(dest => dest.tableId === table.tableId)
			);

			// Get matching patterns for this table
			const matchingPatterns = parentMappings.map(mapping =>
				mapping.filePatterns[0].toString().replace(/^\/|\/[gimuy]*$/g, '')
			);

			// Build table info
			return {
				tableName: table.tableName,
				tableId: table.tableId,
				category: parentMappings[0]?.category || 'unknown',
				primaryKeys: table.primaryKeys,
				// Convert column mappings to a list of field information
				columns: table.columnMappings.map(col => ({
					name: col.dbColumn,
					csvColumn: col.csvColumn,
					isPrimaryKey: table.primaryKeys.includes(col.dbColumn),
					isRequired: table.primaryKeys.includes(col.dbColumn), // Primary keys are required
					hasTransform: !!col.transform
				})),
				// Does this table use a row expander for one-to-many?
				hasRowExpander: !!table.rowExpander,
				// Patterns that can map to this table
				matchingPatterns
			};
		});

		// Transform file patterns
		const filePatterns = csvFileMappings
			.filter(mapping => mapping.category === 'data') // Only include data mappings
			.map(mapping => ({
				pattern: mapping.filePatterns[0].toString().replace(/^\/|\/[gimuy]*$/g, ''),
				description: mapping.description,
				examples: 'examples' in mapping ? mapping.examples : [],
				destinations: mapping.destinations.map(d => ({
					tableName: d.tableName,
					tableId: d.tableId
				}))
			}));

		// Calculate stats
		const dataTableCount = tables.filter(t => t.category === 'data').length;
		const lookupTableCount = tables.filter(t => t.category === 'lookup').length;

		// Return the complete import info
		return {
			tables,
			filePatterns,
			stats: {
				tableCount: tables.length,
				dataTableCount,
				lookupTableCount
			}
		};
	}

	/**
	 * Validate CSV headers against expected columns for a table
	 * @param tableId ID of the table to validate against
	 * @param csvHeaders Array of CSV column headers
	 * @returns Validation results with mapping suggestions
	 */
	static validateCsvColumns(tableId: string, csvHeaders: string[]) {
		// Get all destination tables
		const allTables = getAllDestinationTables();

		// Find the requested table
		const targetTable = allTables.find(t => t.tableId === tableId);

		if (!targetTable) {
			throw new Error(`Table not found: ${tableId}`);
		}

		// Expected columns from the table definition
		const expectedColumns = targetTable.columnMappings.map(col => col.csvColumn);

		// Find matching and missing columns
		const matchingColumns = csvHeaders.filter(header =>
			expectedColumns.includes(header)
		);

		const missingColumns = expectedColumns.filter(expected =>
			!csvHeaders.includes(expected)
		);

		// Find extra columns that were not expected
		const extraColumns = csvHeaders.filter(header =>
			!expectedColumns.includes(header)
		);

		// Calculate match percentage
		const matchPercentage = expectedColumns.length > 0
			? (matchingColumns.length / expectedColumns.length) * 100
			: 0;

		// Generate suggested mappings for the CSV headers
		const mappingSuggestions = csvHeaders.map(header => {
			// Direct match
			if (expectedColumns.includes(header)) {
				return {
					csvHeader: header,
					suggestedDbColumn: targetTable.columnMappings.find(
						col => col.csvColumn === header
					)?.dbColumn || null,
					confidence: 'high'
				};
			}

			// Find closest matches for suggestions
			// (This is a simplified version - the actual implementation might have more complex logic)
			const normalizedHeader = header.toLowerCase().replace(/[_\s-]/g, '');

			const possibleMatches = targetTable.columnMappings
				.filter(col => !matchingColumns.includes(col.csvColumn))
				.map(col => {
					const normalizedCol = col.csvColumn.toLowerCase().replace(/[_\s-]/g, '');
					// Simple similarity check (contains)
					const similarity = normalizedCol.includes(normalizedHeader) ||
						normalizedHeader.includes(normalizedCol) ? 0.5 : 0;
					return {
						csvHeader: header,
						dbColumn: col.dbColumn,
						csvColumn: col.csvColumn,
						similarity
					};
				})
				.filter(match => match.similarity > 0)
				.sort((a, b) => b.similarity - a.similarity);

			if (possibleMatches.length > 0) {
				return {
					csvHeader: header,
					suggestedDbColumn: possibleMatches[0].dbColumn,
					suggestedCsvColumn: possibleMatches[0].csvColumn,
					confidence: 'medium'
				};
			}

			return {
				csvHeader: header,
				suggestedDbColumn: null,
				confidence: 'low'
			};
		});

		return {
			tableId,
			tableName: targetTable.tableName,
			matchingColumns,
			missingColumns,
			extraColumns,
			matchPercentage,
			isValidForImport: missingColumns.length === 0 || matchPercentage >= 80,
			mappingSuggestions,
			recommendedAction: missingColumns.length === 0
				? 'proceed'
				: matchPercentage >= 80
					? 'proceed_with_caution'
					: 'review_mapping'
		};
	}

	/**
	 * Helper function to get schema reference by table ID
	 * @param tableId Table ID (kebab-case)
	 * @returns Schema reference or undefined if not found
	 */
	private static getSchemaReference(tableId: string): any {
		// Convert tableId (kebab-case) to schema property name (camelCase)
		const schemaName = tableId
			.split('-')
			.map((part, index) =>
				index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
			)
			.join('');

		return (schema as any)[schemaName];
	}
} 