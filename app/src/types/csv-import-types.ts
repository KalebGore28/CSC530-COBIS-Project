// types.ts - Shared types

export interface TableConfig {
	name: string;
	endpoint: string;
	fields: string[];
	description?: string;
	dependencies?: {
		tableName: string;
		field: string;
		foreignTable: string;
		foreignField: string;
	}[];
}

export interface FileTypeMapping {
	pattern: RegExp;
	tableName: string;
	description: string;
}

export interface ImportError {
	row: Record<string, string>;
	error: string;
	errorType: "foreign_key" | "validation" | "unknown";
	dependencyInfo?: {
		tableName: string;
		field: string;
		value: string;
	};
}

export interface ImportResult {
	totalRecords?: number;
	inserted?: number;
	updated?: number;
	skipped?: number;
	skippedDetails?: { row: any; reason: string }[];
	failed?: number;
	errorDetails?: ImportError[];
	message?: string;
}