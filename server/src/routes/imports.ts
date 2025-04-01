// File: src/routes/importRoutes.ts
import express from 'express';
import importProcessRouter from './import/process';
import importPatternsRouter from './import/patterns';
import importTablesRouter from './import/tables';
import validateColumnsRouter from './import/validate-columns';
import { z } from 'zod';
import 'zod-openapi/extend';

const router = express.Router();

// Import routes
router.use(importProcessRouter);
router.use(importPatternsRouter);
router.use(importTablesRouter);
router.use(validateColumnsRouter);

// OpenAPI Specification for Import Routes
const importProcessSpec = {
  '/api/import/process': {
    post: {
      tags: ['Imports'],
      operationId: 'import_process_csv',
      description: 'Process and import a CSV file',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: z.object({
              file: z.instanceof(File).describe('CSV file to be imported'),
              tableId: z.string().optional().describe('Table ID for lookup tables'),
              importedBy: z.string().describe('User who is importing the data'),
              category: z.string().optional().describe('Import category (data or lookup)'),
            })
          }
        }
      },
      responses: {
        '200': {
          description: 'Import processed successfully',
          content: {
            'application/json': {
              schema: z.object({
                fileName: z.string().describe('Name of the imported file'),
                category: z.string().describe('Import category (data or lookup)'),
                mappingDescription: z.string().describe('Description of the column mapping used'),
                results: z.array(
                  z.object({
                    tableName: z.string().describe('Name of the destination table'),
                    tableId: z.string().describe('ID of the destination table'),
                    success: z.boolean().describe('Whether the import to this table was successful'),
                    message: z.string().describe('Summary message about the import'),
                    totalRecords: z.number().int().describe('Total number of records processed'),
                    inserted: z.number().int().describe('Number of records inserted'),
                    updated: z.number().int().describe('Number of records updated'),
                    skipped: z.number().int().describe('Number of records skipped'),
                    failed: z.number().int().describe('Number of records that failed to import'),
                    errorDetails: z.array(z.string()).optional().describe('Details of any errors encountered')
                  })
                ).describe('Results for each destination table'),
                errors: z.array(z.string()).optional().describe('Any errors encountered during the import process'),
                success: z.boolean().describe('Whether the overall import was successful'),
                timestamp: z.string().describe('Timestamp of when the import was processed')
              })
            }
          }
        },
        '400': {
          description: 'Bad request - Invalid file or missing parameters',
          content: {
            'application/json': {
              schema: z.object({
                error: z.string().describe('Error message'),
                category: z.string().optional().describe('Import category that was attempted'),
                fileName: z.string().optional().describe('Name of the file that was uploaded'),
                tableId: z.union([z.string(), z.null()]).optional().describe('ID of the table that was targeted')
              })
            }
          }
        },
        '500': {
          description: 'Server error during import processing',
          content: {
            'application/json': {
              schema: z.object({
                error: z.string().describe('Error type'),
                message: z.string().describe('Detailed error message')
              })
            }
          }
        }
      }
    }
  }
};

const importPatternsSpec = {
  '/api/import/patterns': {
    get: {
      tags: ['Imports'],
      operationId: 'get_import_patterns',
      description: 'Get available file patterns for data tables',
      parameters: [],
      responses: {
        '200': {
          description: 'List of file patterns that match data tables',
          content: {
            'application/json': {
              schema: z.object({
                patterns: z.array(
                  z.object({
                    filePatterns: z.array(z.string()).describe('Regular expression patterns for matching filenames'),
                    description: z.string().describe('Description of the data import pattern'),
                    examples: z.array(z.string()).describe('Example filenames that match the patterns'),
                    destinations: z.array(
                      z.object({
                        tableName: z.string().describe('Name of the destination table'),
                        tableId: z.string().describe('ID of the destination table')
                      })
                    ).describe('Destination tables for the imported data')
                  })
                ).describe('Available file patterns for data tables'),
                count: z.number().int().describe('Total number of patterns available')
              })
            }
          }
        },
        '500': {
          description: 'Server error during pattern retrieval',
          content: {
            'application/json': {
              schema: z.object({
                error: z.string().describe('Error type'),
                message: z.string().describe('Detailed error message')
              })
            }
          }
        }
      }
    }
  }
};

const importTablesSpec = {
  '/api/import/tables': {
    get: {
      tags: ['Imports'],
      operationId: 'get_import_tables',
      description: 'Get all available import tables with their metadata',
      parameters: [],
      responses: {
        '200': {
          description: 'List of available tables for import',
          content: {
            'application/json': {
              schema: z.object({
                tables: z.array(
                  z.object({
                    tableName: z.string().describe('Name of the table'),
                    tableId: z.string().describe('Unique identifier for the table'),
                    category: z.enum(['data', 'lookup', 'unknown']).describe('Category of the table (data or lookup)'),
                    primaryKeys: z.array(z.string()).describe('List of column names that make up the primary key'),
                    fields: z.array(
                      z.object({
                        name: z.string().describe('Database column name'),
                        csvColumn: z.string().describe('CSV column name that maps to this database column'),
                        hasTransform: z.boolean().describe('Whether this field has a transform function'),
                        isPrimaryKey: z.boolean().describe('Whether this field is part of the primary key')
                      })
                    ).describe('Column mapping information for this table'),
                    hasRowExpander: z.boolean().describe('Whether this table uses a row expander for one-to-many relationships')
                  })
                ).describe('All available tables for import'),
                dataTables: z.array(
                  z.object({
                    tableName: z.string(),
                    tableId: z.string(),
                    category: z.literal('data'),
                    primaryKeys: z.array(z.string()),
                    fields: z.array(
                      z.object({
                        name: z.string(),
                        csvColumn: z.string(),
                        hasTransform: z.boolean(),
                        isPrimaryKey: z.boolean()
                      })
                    ),
                    hasRowExpander: z.boolean()
                  })
                ).describe('Subset of tables categorized as data tables'),
                lookupTables: z.array(
                  z.object({
                    tableName: z.string(),
                    tableId: z.string(),
                    category: z.literal('lookup'),
                    primaryKeys: z.array(z.string()),
                    fields: z.array(
                      z.object({
                        name: z.string(),
                        csvColumn: z.string(),
                        hasTransform: z.boolean(),
                        isPrimaryKey: z.boolean()
                      })
                    ),
                    hasRowExpander: z.boolean()
                  })
                ).describe('Subset of tables categorized as lookup tables'),
                count: z.number().int().describe('Total number of tables available')
              })
            }
          }
        },
        '500': {
          description: 'Server error during table retrieval',
          content: {
            'application/json': {
              schema: z.object({
                error: z.string().describe('Error type'),
                message: z.string().describe('Detailed error message')
              })
            }
          }
        }
      }
    }
  }
};

const validateColumnsSpec = {
  '/api/import/validate-columns': {
    post: {
      tags: ['Imports'],
      operationId: 'validate_csv_columns',
      description: 'Validate CSV headers against expected columns for a table',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: z.object({
              tableId: z.string().describe('ID of the table to validate against'),
              csvHeaders: z.array(z.string()).describe('Array of CSV column headers')
            })
          }
        }
      },
      responses: {
        '200': {
          description: 'Validation results with mapping suggestions',
          content: {
            'application/json': {
              schema: z.object({
                isValid: z.boolean().describe('Whether all required columns are present'),
                tableId: z.string().describe('ID of the table that was validated against'),
                tableName: z.string().describe('Name of the table that was validated against'),
                exactMatches: z.record(z.string(), z.string()).describe('Map of database columns to exactly matching CSV columns'),
                suggestedMatches: z.record(
                  z.string(),
                  z.object({
                    csvColumn: z.string().describe('CSV column that might match'),
                    similarity: z.number().describe('Similarity score (0-1) between expected and found column')
                  })
                ).describe('Map of database columns to suggested CSV columns with similarity scores'),
                unmatchedColumns: z.array(z.string()).describe('Database columns with no exact match in CSV'),
                missingRequiredColumns: z.array(z.string()).describe('Required columns (primary keys) missing from CSV'),
                expectedColumns: z.array(
                  z.object({
                    dbColumn: z.string().describe('Database column name'),
                    csvColumn: z.string().describe('Expected CSV column name'),
                    isPrimaryKey: z.boolean().describe('Whether this column is part of the primary key'),
                    hasTransform: z.boolean().describe('Whether this column has a transform function')
                  })
                ).describe('List of all expected columns for this table'),
                csvHeaders: z.array(z.string()).describe('Original CSV headers that were validated'),
                suggestedMapping: z.record(z.string(), z.string()).describe('Combined mapping of database columns to CSV columns (exact and suggested)')
              })
            }
          }
        },
        '400': {
          description: 'Missing parameters or table not found',
          content: {
            'application/json': {
              schema: z.object({
                error: z.string().describe('Error type'),
                message: z.string().describe('Detailed error message')
              })
            }
          }
        },
        '500': {
          description: 'Server error during validation',
          content: {
            'application/json': {
              schema: z.object({
                error: z.string().describe('Error type'),
                message: z.string().describe('Detailed error message')
              })
            }
          }
        }
      }
    }
  }
};

// Export combined API specs
export const importRoutesAPISpecs = {
  ...importProcessSpec,
  ...importPatternsSpec,
  ...importTablesSpec,
  ...validateColumnsSpec
};

export default router;