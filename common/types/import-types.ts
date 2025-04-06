/**
 * Common types for import functionality
 * These types are shared between frontend and backend
 */

/**
 * Import table column information
 */
export interface ImportTableColumn {
	name: string;
	csvColumn?: string;
	isPrimaryKey: boolean;
	isRequired: boolean;
	hasTransform: boolean;
}

/**
 * Import table metadata
 */
export interface ImportTable {
	tableName: string;
	tableId: string;
	category: string;
	primaryKeys: string[];
	columns: ImportTableColumn[];
	hasRowExpander: boolean;
	matchingPatterns?: string[];
}

/**
 * File pattern information
 */
export interface FilePattern {
	pattern: string;
	description: string;
	examples?: string[];
	destinations: { tableName: string; tableId: string }[];
}

/**
 * Import statistics
 */
export interface ImportStats {
	tableCount: number;
	dataTableCount: number;
	lookupTableCount: number;
}

/**
 * Complete import information response
 */
export interface ImportInfoResponse {
	tables: ImportTable[];
	filePatterns: FilePattern[];
	stats: ImportStats;
}

/**
 * Import error details
 */
export interface ImportError {
	row: number;
	error: string;
}

/**
 * Import table result
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
 * Import process request
 */
export interface ImportProcessRequest {
	file: File;
	tableId?: string;
	columnMapping?: Record<string, string>;
}

/**
 * Import result
 */
export interface ImportResult {
	fileName: string;
	category: string;
	mappingDescription: string;
	results: ImportTableResult[];
	errors?: string[];
	success: boolean;
	timestamp: string;
} 