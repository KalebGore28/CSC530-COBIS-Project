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

// Schema for the table column in ImportInfoResponse
const ImportTableColumnSchema = z.object({
	name: z.string().openapi({
		description: 'Database column name'
	}),
	csvColumn: z.string().openapi({
		description: 'CSV column name that maps to this database column'
	}),
	isPrimaryKey: z.boolean().openapi({
		description: 'Whether this field is part of the primary key'
	}),
	isRequired: z.boolean().openapi({
		description: 'Whether this field is required for import'
	}),
	hasTransform: z.boolean().openapi({
		description: 'Whether this field has a transform function'
	}),
});

// Schema for the table in ImportInfoResponse
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
	columns: z.array(ImportTableColumnSchema).openapi({
		description: 'Column mapping information for this table'
	}),
	hasRowExpander: z.boolean().openapi({
		description: 'Whether this table uses a row expander for one-to-many relationships'
	}),
	matchingPatterns: z.array(z.string()).openapi({
		description: 'Patterns that can map to this table'
	})
});

// Schema for file pattern destinations
const ImportPatternDestinationSchema = z.object({
	tableName: z.string().openapi({
		description: 'Name of the destination table'
	}),
	tableId: z.string().openapi({
		description: 'ID of the destination table'
	}),
});

// Schema for file patterns in ImportInfoResponse
const FilePatternSchema = z.object({
	pattern: z.string().openapi({
		description: 'Regular expression pattern for matching filenames'
	}),
	description: z.string().openapi({
		description: 'Description of the data import pattern'
	}),
	examples: z.array(z.string()).openapi({
		description: 'Example filenames that match the pattern'
	}),
	destinations: z.array(ImportPatternDestinationSchema).openapi({
		description: 'Destination tables for the imported data'
	}),
});

// Schema for stats in ImportInfoResponse
const ImportStatsSchema = z.object({
	tableCount: z.number().int().openapi({
		description: 'Total number of tables available'
	}),
	dataTableCount: z.number().int().openapi({
		description: 'Number of data tables available'
	}),
	lookupTableCount: z.number().int().openapi({
		description: 'Number of lookup tables available'
	})
});

// Combined schema for the new import info endpoint
const ImportInfoResponseSchema = z.object({
	csvMappings: z.array(
		z.object({
			description: z.string(),
			category: z.enum(['data', 'lookup']),
			filePatterns: z.array(z.string()).optional(),
			destinations: z.array(
				z.object({
					tableName: z.string(),
					tableId: z.string(),
					primaryKeys: z.array(z.string()),
					columns: z.array(ImportTableColumnSchema),
					hasRowExpander: z.boolean().optional()
				})
			).optional(),
			destination: z.object({
				tableName: z.string(),
				tableId: z.string(),
				primaryKeys: z.array(z.string()),
				columns: z.array(ImportTableColumnSchema),
				hasRowExpander: z.boolean().optional()
			}).optional()
		})
	).openapi({
		description: 'All CSV file mapping configurations'
	}),
	stats: z.object({
		tableCount: z.number(),
		dataTableCount: z.number(),
		lookupTableCount: z.number()
	}).openapi({
		description: 'Statistics about available tables and mappings'
	})
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
	'/api/import/info': {
		get: {
			tags: ['Imports'],
			operationId: 'get_import_info',
			summary: 'Get comprehensive import information',
			description: 'Get all available tables, file patterns, and metadata needed for CSV imports',
			responses: {
				'200': {
					description: 'Complete import information including tables and file patterns',
					content: {
						'application/json': {
							schema: ImportInfoResponseSchema
						}
					}
				},
				'500': {
					description: 'Server error during import information retrieval',
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
	ImportTableColumnSchema,
	FilePatternSchema,
	ImportPatternDestinationSchema,
	ImportInfoResponseSchema,
	ImportStatsSchema
}; 