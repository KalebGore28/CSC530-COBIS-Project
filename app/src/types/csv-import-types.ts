/**
 * Configuration for a table that can be imported into
 */
export interface TableConfig {
	tableName: string;      // Display name of the table
	tableId: string;        // Unique identifier for the table
	category: 'data' | 'lookup' | 'unknown';
	primaryKeys: string[];  // List of primary key fields
	fields: TableField[];   // List of field configurations
	hasRowExpander: boolean; // Whether this table uses a row expander
	endpoint?: string;      // API endpoint for importing (maintained for backward compatibility)
  }
  
  /**
   * Configuration for a table field/column
   */
  export interface TableField {
	name: string;           // Database column name
	csvColumn: string;      // Expected CSV column name
	isPrimaryKey: boolean;  // Whether this is a primary key
	hasTransform: boolean;  // Whether this field has transformation logic
  }
  
  /**
   * File pattern for automatic table detection
   */
  export interface FilePattern {
	filePatterns: string[]; // RegExp patterns as strings
	description: string;    // Description of the pattern
	examples: string[];     // Example filenames that match this pattern
	destinations: {         // Destination tables for this pattern
	  tableName: string;
	  tableId: string;
	}[];
  }
  
  /**
   * Response from the validate-columns API
   */
  export interface ColumnValidationResult {
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
	  value?: string; // For backward compatibility
	};
  }
  
  /**
   * API Responses for new endpoints
   */
  
  export interface ImportPatternsResponse {
	patterns: FilePattern[];
	count: number;
  }
  
  export interface ImportTablesResponse {
	tables: TableConfig[];
	dataTables: TableConfig[];
	lookupTables: TableConfig[];
	count: number;
  }