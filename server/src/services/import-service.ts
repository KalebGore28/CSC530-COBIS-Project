import * as schema from '../db/schema';
import { importData } from '../utils/importData';
import { importCSV } from '../utils/importCSV';
import { AnySQLiteTable } from 'drizzle-orm/sqlite-core';
import {
	findMappingsForFilename,
	findMappingsForLookupTable,
	mapCsvDataToDbData,
	getImportInfo,
	DataCsvMapping,
	LookupCsvMapping,
	CSVFileMapping
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
		let fileMapping: CSVFileMapping | null = findMappingsForFilename(fileName);
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

		// Handle both data and lookup mappings
		const destinations = fileMapping.category === 'data'
			? (fileMapping as DataCsvMapping).destinations
			: [(fileMapping as LookupCsvMapping).destination];

		for (const destination of destinations) {
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
		// Use the method from column-mapping-service to ensure consistency
		const { csvMappings, stats } = getImportInfo();

		return {
			csvMappings,
			stats
		};
	}

	/**
	 * Helper function to get schema reference by table ID
	 * @param tableId Table ID (kebab-case)
	 * @returns Schema reference or undefined if not found
	 */
	private static getSchemaReference(tableId: string): AnySQLiteTable | undefined {
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