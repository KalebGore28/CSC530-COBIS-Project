import { z } from 'zod';
import 'zod-openapi/extend';

// Define reusable schemas for import operations
const ImportProcessRequestSchema = z.object({
	file: z.instanceof(File).openapi({
		description: 'CSV file to be imported'
	}),
	tableId: z.string().optional().openapi({
		description: 'Table ID for lookup tables'
	}),
	importedBy: z.string().openapi({
		description: 'User who is importing the data'
	}),
	category: z.string().optional().openapi({
		description: 'Import category (data or lookup)'
	}),
});

const ImportResultSchema = z.object({
	tableName: z.string().openapi({
		description: 'Name of the destination table'
	}),
	tableId: z.string().openapi({
		description: 'ID of the destination table'
	}),
	success: z.boolean().openapi({
		description: 'Whether the import to this table was successful'
	}),
	message: z.string().openapi({
		description: 'Summary message about the import'
	}),
	totalRecords: z.number().int().openapi({
		description: 'Total number of records processed'
	}),
	inserted: z.number().int().openapi({
		description: 'Number of records inserted'
	}),
	updated: z.number().int().openapi({
		description: 'Number of records updated'
	}),
	skipped: z.number().int().openapi({
		description: 'Number of records skipped'
	}),
	failed: z.number().int().openapi({
		description: 'Number of records that failed to import'
	}),
	errorDetails: z.array(z.string()).optional().openapi({
		description: 'Details of any errors encountered'
	}),
});

const ImportProcessResponseSchema = z.object({
	fileName: z.string().openapi({
		description: 'Name of the imported file'
	}),
	category: z.string().openapi({
		description: 'Import category (data or lookup)'
	}),
	mappingDescription: z.string().openapi({
		description: 'Description of the column mapping used'
	}),
	results: z.array(ImportResultSchema).openapi({
		description: 'Results for each destination table'
	}),
	errors: z.array(z.string()).optional().openapi({
		description: 'Any errors encountered during the import process'
	}),
	success: z.boolean().openapi({
		description: 'Whether the overall import was successful'
	}),
	timestamp: z.string().openapi({
		description: 'Timestamp of when the import was processed'
	}),
});

const ImportTableFieldSchema = z.object({
	name: z.string().openapi({
		description: 'Database column name'
	}),
	csvColumn: z.string().openapi({
		description: 'CSV column name that maps to this database column'
	}),
	hasTransform: z.boolean().openapi({
		description: 'Whether this field has a transform function'
	}),
	isPrimaryKey: z.boolean().openapi({
		description: 'Whether this field is part of the primary key'
	}),
});

const ImportTableSchema = z.object({
	tableName: z.string().openapi({
		description: 'Name of the table'
	}),
	tableId: z.string().openapi({
		description: 'Unique identifier for the table'
	}),
	category: z.enum(['data', 'lookup', 'unknown']).openapi({
		description: 'Category of the table (data or lookup)'
	}),
	primaryKeys: z.array(z.string()).openapi({
		description: 'List of column names that make up the primary key'
	}),
	fields: z.array(ImportTableFieldSchema).openapi({
		description: 'Column mapping information for this table'
	}),
	hasRowExpander: z.boolean().openapi({
		description: 'Whether this table uses a row expander for one-to-many relationships'
	}),
});

const ImportTablesResponseSchema = z.object({
	tables: z.array(ImportTableSchema).openapi({
		description: 'All available tables for import'
	}),
	dataTables: z.array(ImportTableSchema.extend({
		category: z.literal('data')
	})).openapi({
		description: 'Subset of tables categorized as data tables'
	}),
	lookupTables: z.array(ImportTableSchema.extend({
		category: z.literal('lookup')
	})).openapi({
		description: 'Subset of tables categorized as lookup tables'
	}),
	count: z.number().int().openapi({
		description: 'Total number of tables available'
	}),
});

const ImportPatternDestinationSchema = z.object({
	tableName: z.string().openapi({
		description: 'Name of the destination table'
	}),
	tableId: z.string().openapi({
		description: 'ID of the destination table'
	}),
});

const ImportPatternSchema = z.object({
	filePatterns: z.array(z.string()).openapi({
		description: 'Regular expression patterns for matching filenames'
	}),
	description: z.string().openapi({
		description: 'Description of the data import pattern'
	}),
	examples: z.array(z.string()).openapi({
		description: 'Example filenames that match the patterns'
	}),
	destinations: z.array(ImportPatternDestinationSchema).openapi({
		description: 'Destination tables for the imported data'
	}),
});

const ImportPatternsResponseSchema = z.object({
	patterns: z.array(ImportPatternSchema).openapi({
		description: 'Available file patterns for data tables'
	}),
	count: z.number().int().openapi({
		description: 'Total number of patterns available'
	}),
});

const ValidateColumnsRequestSchema = z.object({
	tableId: z.string().openapi({
		description: 'ID of the table to validate against'
	}),
	csvHeaders: z.array(z.string()).openapi({
		description: 'Array of CSV column headers'
	}),
});

const MappingSuggestionSchema = z.object({
	csvHeader: z.string().openapi({
		description: 'CSV header'
	}),
	suggestedDbColumn: z.string().nullable().openapi({
		description: 'Suggested database column for this CSV header'
	}),
	suggestedCsvColumn: z.string().optional().openapi({
		description: 'Suggested CSV column name that would match a database column'
	}),
	confidence: z.enum(['high', 'medium', 'low']).openapi({
		description: 'Confidence level of the suggestion'
	}),
});

const ValidateColumnsResponseSchema = z.object({
	tableId: z.string().openapi({
		description: 'ID of the table validated against'
	}),
	tableName: z.string().openapi({
		description: 'Name of the table validated against'
	}),
	matchingColumns: z.array(z.string()).openapi({
		description: 'CSV headers that match expected columns'
	}),
	missingColumns: z.array(z.string()).openapi({
		description: 'Expected columns that are missing from the CSV'
	}),
	extraColumns: z.array(z.string()).openapi({
		description: 'CSV headers that don\'t match any expected column'
	}),
	matchPercentage: z.number().openapi({
		description: 'Percentage of expected columns that match CSV headers'
	}),
	isValidForImport: z.boolean().openapi({
		description: 'Whether the CSV is valid for import'
	}),
	mappingSuggestions: z.array(MappingSuggestionSchema).openapi({
		description: 'Suggestions for mapping CSV headers to database columns'
	}),
	recommendedAction: z.enum(['proceed', 'proceed_with_caution', 'review_mapping']).openapi({
		description: 'Recommended action based on validation results'
	}),
});

// Schemas for import-related API endpoints
export const ImportAPISpecs = {
	'/api/import/process': {
		post: {
			tags: ['Imports'],
			operationId: 'import_process_csv',
			summary: 'Process and import CSV data',
			description: 'Process and import a CSV file',
			requestBody: {
				required: true,
				content: {
					'multipart/form-data': {
						schema: ImportProcessRequestSchema
					}
				}
			},
			responses: {
				'200': {
					description: 'Import processed successfully',
					content: {
						'application/json': {
							schema: ImportProcessResponseSchema
						}
					}
				},
				'400': {
					description: 'Bad request - Invalid file or missing parameters',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error message'
								}),
								category: z.string().optional().openapi({
									description: 'Import category that was attempted'
								}),
								fileName: z.string().optional().openapi({
									description: 'Name of the file that was uploaded'
								}),
								tableId: z.union([z.string(), z.null()]).optional().openapi({
									description: 'ID of the table that was targeted'
								})
							})
						}
					}
				},
				'500': {
					description: 'Server error during import processing',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error type'
								}),
								message: z.string().openapi({
									description: 'Detailed error message'
								})
							})
						}
					}
				}
			}
		}
	},
	'/api/import/patterns': {
		get: {
			tags: ['Imports'],
			operationId: 'get_import_patterns',
			summary: 'Get available import file patterns',
			description: 'Get available file patterns for data tables',
			responses: {
				'200': {
					description: 'List of file patterns that match data tables',
					content: {
						'application/json': {
							schema: ImportPatternsResponseSchema
						}
					}
				},
				'500': {
					description: 'Server error during pattern retrieval',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error type'
								}),
								message: z.string().openapi({
									description: 'Detailed error message'
								})
							})
						}
					}
				}
			}
		}
	},
	'/api/import/tables': {
		get: {
			tags: ['Imports'],
			operationId: 'get_import_tables',
			summary: 'Get available import tables',
			description: 'Get all available import tables with their metadata',
			responses: {
				'200': {
					description: 'List of available tables for import',
					content: {
						'application/json': {
							schema: ImportTablesResponseSchema
						}
					}
				},
				'500': {
					description: 'Server error during table retrieval',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error type'
								}),
								message: z.string().openapi({
									description: 'Detailed error message'
								})
							})
						}
					}
				}
			}
		}
	},
	'/api/import/validate-columns': {
		post: {
			tags: ['Imports'],
			operationId: 'validate_csv_columns',
			summary: 'Validate CSV headers against table schema',
			description: 'Validate CSV headers against expected columns for a table',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: ValidateColumnsRequestSchema
					}
				}
			},
			responses: {
				'200': {
					description: 'Validation results with mapping suggestions',
					content: {
						'application/json': {
							schema: ValidateColumnsResponseSchema
						}
					}
				},
				'400': {
					description: 'Bad request - Missing or invalid parameters',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error type'
								}),
								message: z.string().openapi({
									description: 'Detailed error message'
								})
							})
						}
					}
				},
				'500': {
					description: 'Server error during validation',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error type'
								}),
								message: z.string().openapi({
									description: 'Detailed error message'
								})
							})
						}
					}
				}
			}
		}
	}
};

// Export schemas for reuse in other parts of the application
export const ImportSpecs = {
	ImportProcessRequestSchema,
	ImportProcessResponseSchema,
	ImportResultSchema,
	ImportTableSchema,
	ImportTableFieldSchema,
	ImportTablesResponseSchema,
	ImportPatternSchema,
	ImportPatternDestinationSchema,
	ImportPatternsResponseSchema,
	ValidateColumnsRequestSchema,
	ValidateColumnsResponseSchema,
	MappingSuggestionSchema
}; 