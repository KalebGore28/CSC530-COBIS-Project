/**
 * Types for CSV import functionality
 */

// Column definition
export interface ColumnDefinition {
	name: string;
	csvColumn: string;
	isPrimaryKey: boolean;
	isRequired: boolean;
	hasTransform: boolean;
}

// Table Configuration
export interface TableConfig {
	tableName: string;
	tableId: string;
	category: 'data' | 'lookup';
	primaryKeys: string[];
	hasRowExpander: boolean;
	columns: ColumnDefinition[];
	matchingPatterns?: string[];
}

// CSV Mapping
export interface CsvMapping {
	filePatterns: string[];
	description: string;
	category: 'data' | 'lookup';
	destination?: TableConfig;
	destinations?: TableConfig[];
}

// API Response for import info
export interface ImportInfoResponse {
	csvMappings: CsvMapping[];
	stats: {
		csvMappingCount: number;
		dataTableCount: number;
		lookupTableCount: number;
	};
}

// Import Results
export interface ImportResult {
	success: boolean;
	totalRecords: number;
	inserted: number;
	updated: number;
	skipped: number;
	failed: number;
	errorDetails?: ImportError[];
}

// Import Error
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