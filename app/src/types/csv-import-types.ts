/**
 * Types for CSV import functionality
 */

/**
 * Column definition for mapping between CSV and database
 */
export interface ColumnDefinition {
	dbColumn: string;           // Database column name
	csvColumn: string;          // Expected CSV column name
	isPrimaryKey: boolean;      // Whether this is a primary key column
	hasTransform?: boolean;     // Whether this column needs server-side transformation
}

/**
 * Table configuration (destination of imports)
 */
export interface TableConfig {
	tableName: string;           // Human-readable table name
	tableId: string;             // Unique identifier for the table
	category: 'data' | 'lookup'; // Type of table
	primaryKeys: string[];       // Array of column names that make up the primary key
	hasRowExpander: boolean;     // Whether this table uses row expansion (1 CSV row → multiple DB rows)
	columns: ColumnDefinition[]; // Column definitions for this table
}

/**
 * CSV Mapping - defines how files map to database tables
 */
export interface BaseCsvMapping {
	description: string;         // Human-readable description
	category: 'data' | 'lookup'; // Type of mapping
	filePatterns: string[];      // Patterns to match against file names
}

/**
 * Mapping for data tables (one file → multiple tables)
 */
export interface DataCsvMapping extends BaseCsvMapping {
	category: 'data';
	destinations: TableConfig[];  // Multiple destination tables
}

/**
 * Mapping for lookup tables (one file → one table)
 */
export interface LookupCsvMapping extends BaseCsvMapping {
	category: 'lookup';
	destination: TableConfig;     // Single destination table
}

/**
 * Union type for CSV mappings
 */
export type CsvMapping = DataCsvMapping | LookupCsvMapping;

/**
 * API Response for import info
 */
export interface ImportInfoResponse {
	csvMappings: CsvMapping[];   // Array of all available mappings
	stats: {
		csvMappingCount: number; // Total number of mappings
		dataTableCount: number;  // Number of data table mappings
		lookupTableCount: number;// Number of lookup table mappings
	};
}

/**
 * Result of an import operation
 */
export interface ImportResult {
	success: boolean;
	totalRecords: number;
	inserted: number;
	updated: number;
	skipped: number;
	failed: number;
	errorDetails?: ImportError[];
}

/**
 * Error details for failed imports
 */
export interface ImportError {
	row: Record<string, any>;
	error: string;
	errorType: string;
	dependencyInfo?: {
		tableName: string;
		columns: string[];
		values: Record<string, any>;
	};
}

/**
 * Helper type for file and mapping association
 */
export interface FileMapping {
	file: File;
	mapping: CsvMapping;
	matchedPattern: string;
}