import { importData } from '../utils/importData';
import { AnySQLiteTable } from 'drizzle-orm/sqlite-core';
import {
	findMappingsForLookupTable,
	mapCsvDataToDbData,
	getImportInfo,
	DataCsvMapping,
	LookupCsvMapping,
	CSVFileMapping,
	getMappingByDescription
} from '../services/column-mapping-service';

/**
 * Service for handling data import operations
 */
export class ImportService {
	/**
	 * Process and import a CSV file
	 * @param csvData Parsed CSV data
	 * @param tableId Optional tableId for lookup tables
	 * @returns Import results
	 */
	static async processImport(
		csvData: Record<string, string>[],
		csvMapping: CSVFileMapping | null,
		tableId?: string
	) {
		if (!csvData || csvData.length === 0) {
			throw new Error('Empty or invalid CSV file');
		}

		// Try to find mapping by filename (for data tables)
		let category = 'data';

		// If not found and tableId is provided, try to find mapping for lookup table
		if (!csvMapping && tableId) {
			csvMapping = findMappingsForLookupTable(tableId);
			category = 'lookup';
		}

		// Workaround - If is data table, get the description from the mapping
		// Since the schemaRef is only available on the server side, we need to get it by using the description
		// This workaround is quick and dirty, but it works for now
		if (csvMapping && csvMapping.category === 'data') {
			csvMapping = getMappingByDescription(csvMapping.description);
		}

		// If still no mapping found
		if (!csvMapping) {
			throw new Error('No mapping found for this file');
		}

		// Process each destination
		const results = [];
		const errors = [];

		// Handle both data and lookup mappings
		const destinations = csvMapping.category === 'data'
			? (csvMapping as DataCsvMapping).destinations
			: [(csvMapping as LookupCsvMapping).destination];

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
				const tableSchema = destination.schemaRef as AnySQLiteTable;

				if (!tableSchema) {
					throw new Error(`Schema not found for table: ${destination.tableName}`);
				}

				// Import the data
				const importResult = await importData(
					tableSchema,
					destination.primaryKeys,
					mappedData,
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
			category,
			mappingDescription: csvMapping.description,
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
} 