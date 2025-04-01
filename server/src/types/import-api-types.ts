/**
 * API response from GET /api/import/patterns
 */
export interface ImportPatternResponse {
	patterns: ImportPattern[];
	count: number;
}

export interface ImportPattern {
	filePatterns: string[];
	description: string;
	example: string;
	destinations: {
		tableName: string;
		tableId: string;
	}[];
}

/**
 * API response from GET /api/import/tables
 */
export interface ImportTablesResponse {
	tables: ImportTable[];
	dataTables: ImportTable[];
	lookupTables: ImportTable[];
	count: number;
}

export interface ImportTable {
	tableName: string;
	tableId: string;
	category: 'data' | 'lookup' | 'unknown';
	primaryKeys: string[];
	fields: ImportTableField[];
	hasRowExpander: boolean;
}

export interface ImportTableField {
	name: string;
	csvColumn: string;
	hasTransform: boolean;
	isPrimaryKey: boolean;
}

/**
 * API request for POST /api/import/validate-columns
 */
export interface ValidateColumnsRequest {
	tableId: string;
	csvHeaders: string[];
}

/**
 * API response from POST /api/import/validate-columns
 */
export interface ValidateColumnsResponse {
	isValid: boolean;
	tableId: string;
	tableName: string;
	exactMatches: Record<string, string>;
	suggestedMatches: Record<string, {
		csvColumn: string;
		similarity: number;
	}>;
	unmatchedColumns: string[];
	missingRequiredColumns: string[];
	expectedColumns: {
		dbColumn: string;
		csvColumn: string;
		isPrimaryKey: boolean;
		hasTransform: boolean;
	}[];
	csvHeaders: string[];
	suggestedMapping: Record<string, string>;
}

/**
 * Type definitions for the existing import process API
 * (These should be adjusted to match your actual implementation)
 */
export interface ImportProcessRequest {
	file: File;
	tableId?: string;
	importedBy: string;
}

export interface ImportResult {
	fileName?: string;
	category?: 'data' | 'lookup';
	mappingDescription?: string;
	results?: ImportTableResult[];
	errors?: string[];
	success?: boolean;
	timestamp?: string;
	message?: string; // For error messages
}

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

export interface ImportError {
	row: Record<string, string>;
	error: string;
	errorType: string;
	dependencyInfo?: {
		tableName: string;
		columns: string[];
		values: Record<string, string>;
	};
}