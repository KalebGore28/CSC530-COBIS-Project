/**
 * Configuration for a table that can be imported into
 */
export interface TableConfig {
	tableName: string;      // Display name of the table
	tableId: string;        // Unique identifier for the table
	category: 'data' | 'lookup' | 'unknown';
	primaryKeys: string[];  // List of primary key fields
	columns: TableColumn[]; // List of column configurations
	hasRowExpander: boolean; // Whether this table uses a row expander
	matchingPatterns: string[]; // Patterns that match this table
}

/**
 * Configuration for a table column
 */
export interface TableColumn {
	name: string;           // Database column name
	csvColumn: string;      // Expected CSV column name
	isPrimaryKey: boolean;  // Whether this is a primary key
	isRequired: boolean;    // Whether this field is required
	hasTransform: boolean;  // Whether this field has transformation logic
}

/**
 * File pattern for automatic table detection
 */
export interface FilePattern {
	pattern: string;        // RegExp pattern as string
	description: string;    // Description of the pattern
	examples: string[];     // Example filenames that match this pattern
	destinations: {         // Destination tables for this pattern
		tableName: string;
		tableId: string;
	}[];
}

/**
 * Stats about the available tables
 */
export interface ImportStats {
	tableCount: number;
	dataTableCount: number;
	lookupTableCount: number;
}

/**
 * API response from the consolidated import info endpoint
 */
export interface ImportInfoResponse {
	tables: TableConfig[];
	filePatterns: FilePattern[];
	stats: ImportStats;
}

/**
 * Client-side column validation result
 * (since we no longer have a validation API endpoint)
 */
export interface ColumnValidationResult {
	isValid: boolean;
	tableId: string;
	tableName: string;
	matchingColumns: string[];
	missingColumns: string[];
	extraColumns: string[];
	matchPercentage: number;
	isPrimaryKeyValid: boolean;
	missingRequiredColumns: string[];
	suggestedMapping: Record<string, string>;
}

/**
 * Result of importing data
 */
export interface ImportResult {
	fileName?: string;
	category?: 'data' | 'lookup';
	mappingDescription?: string;
	results?: ImportTableResult[];
	errors?: string[];
	success?: boolean;
	timestamp?: string;
	message?: string;

	// Flattened properties for UI display (derived from results)
	totalRecords?: number;
	inserted?: number;
	updated?: number;
	skipped?: number;
	failed?: number;
	errorDetails?: ImportError[];
	skippedDetails?: {
		row: Record<string, string>;
		reason: string;
	}[];
}

/**
 * Result of importing data into a specific table
 */
export interface ImportTableResult {
	tableName: string;
	tableId: string;
	success: boolean;
	message: string;
	totalRecords: number;
	inserted: number;
	updated: number;
	skipped: number;
	failed: number;
	errorDetails?: string[];
}

/**
 * Detailed error information from an import
 */
export interface ImportError {
	row: Record<string, string>;
	error: string;
	errorType: string;
	dependencyInfo?: {
		tableName: string;
		columns?: string[];
		values?: Record<string, string>;
	};
}

/**
 * Request payload for the import process API
 */
export interface ImportProcessRequest {
	file: File;
	tableId: string;
	importedBy: string;
	mappedData?: Record<string, any>[];
}