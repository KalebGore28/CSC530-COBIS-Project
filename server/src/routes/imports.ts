// File: src/routes/importRoutes.ts
import express from 'express';
import importProcessRouter from './import/process';
import importPatternsRouter from './import/patterns';
import importTablesRouter from './import/tables';
import validateColumnsRouter from './import/validate-columns';

const router = express.Router();

// Import routes
router.use(importProcessRouter);
router.use(importPatternsRouter);
router.use(importTablesRouter);
router.use(validateColumnsRouter);

// If you have OpenAPI documentation, combine the specifications:
import { importAPISpecs } from './import/process';

// Add new specs
const importPatternsSpec = {
  '/api/import/patterns': {
    get: {
      tags: ['Imports'],
      operationId: 'get_import_patterns',
      description: 'Get file patterns for data tables',
      responses: {
        '200': {
          description: 'List of file patterns',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  patterns: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        filePatterns: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        description: { type: 'string' },
                        example: { type: 'string' },
                        destinations: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              tableName: { type: 'string' },
                              tableId: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  },
                  count: { type: 'number' }
                }
              }
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
      description: 'Get all available tables for import',
      responses: {
        '200': {
          description: 'List of available tables',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tables: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        tableName: { type: 'string' },
                        tableId: { type: 'string' },
                        category: { type: 'string' },
                        primaryKeys: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        fields: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              csvColumn: { type: 'string' },
                              hasTransform: { type: 'boolean' },
                              isPrimaryKey: { type: 'boolean' }
                            }
                          }
                        },
                        hasRowExpander: { type: 'boolean' }
                      }
                    }
                  },
                  dataTables: { type: 'array' },
                  lookupTables: { type: 'array' },
                  count: { type: 'number' }
                }
              }
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
      operationId: 'validate_import_columns',
      description: 'Validate CSV headers against expected columns',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['tableId', 'csvHeaders'],
              properties: {
                tableId: {
                  type: 'string',
                  description: 'ID of the table to validate against'
                },
                csvHeaders: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'CSV column headers'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Validation results with mapping suggestions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isValid: { type: 'boolean' },
                  tableId: { type: 'string' },
                  tableName: { type: 'string' },
                  exactMatches: { type: 'object' },
                  suggestedMatches: { type: 'object' },
                  unmatchedColumns: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  missingRequiredColumns: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  expectedColumns: { type: 'array' },
                  csvHeaders: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  suggestedMapping: { type: 'object' }
                }
              }
            }
          }
        }
      }
    }
  }
};

// Export combined API specs
export const importRoutesAPISpecs = {
  ...importAPISpecs,
  ...importPatternsSpec,
  ...importTablesSpec,
  ...validateColumnsSpec
};

export default router;