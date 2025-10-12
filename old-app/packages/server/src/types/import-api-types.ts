/**
 * API response from GET /api/import/info
 */
export interface ImportInfoResponse {
	tables: ImportTable[];
	filePatterns: FilePattern[];
	stats: {
		tableCount: number;
		dataTableCount: number;
		lookupTableCount: number;
	};
}

export interface ImportTable {
	tableName: string;
	tableId: string;
	category: 'data' | 'lookup' | 'unknown';
	primaryKeys: string[];
	columns: ImportTableColumn[];
	hasRowExpander: boolean;
	matchingPatterns: string[];
}

export interface ImportTableColumn {
	name: string;
	csvColumn: string;
	isPrimaryKey: boolean;
	isRequired: boolean;
	hasTransform: boolean;
}

export interface FilePattern {
	pattern: string;
	description: string;
	examples: string[];
	destinations: {
		tableId: string;
		tableName: string;
	}[];
}

/**
 * Type definitions for the import process API
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