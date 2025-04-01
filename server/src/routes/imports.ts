import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import 'zod-openapi/extend';
import { importData } from '../utils/importData';
import { importCSV } from '../utils/importCSV';
import {
	findMappingsForFilename,
	findMappingsForLookupTable,
	mapCsvDataToDbData,
} from '../services/columnMappingService';
import * as schema from '../db/schema';

// Configure multer for file uploads
const upload = multer({
	dest: 'uploads/',
	fileFilter: (req, file, cb) => {
	  // Check if file extension is .csv (case insensitive)
	  if (path.extname(file.originalname).toLowerCase() !== '.csv') {
		return cb(new Error('Only CSV files are allowed'));
	  }
	  // Accept the file regardless of mime type as long as extension is .csv
	  cb(null, true);
	},
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  });

const router = express.Router();

/**
 * Unified import process endpoint
 * @route POST /api/import/process
 * @group Imports - CSV data import operations
 * @param {file} file.formData.required - CSV file to import
 * @param {string} tableId.formData - Table ID for lookup tables
 * @param {string} importedBy.formData.required - User who is importing the data
 * @returns {object} 200 - Import results by table
 * @returns {Error} 400 - Invalid file or missing parameters
 * @returns {Error} 500 - Server error
 */
router.post('/process',
	upload.single('file'),
	async (req: Request, res: Response) => {
		try {
			// Check if file was uploaded
			if (!req.file) {
				res.status(400).json({ error: 'No file uploaded' });
				return;
			}

			const fileName = req.file.originalname;
			const filePath = req.file.path;
			const importedBy = req.body.importedBy || 'system';
			const tableId = req.body.tableId; // Optional for lookup tables

			// Parse the CSV file
			const csvData = await importCSV(filePath);

			if (!csvData || csvData.length === 0) {
				fs.unlinkSync(filePath);
				res.status(400).json({ error: 'Empty or invalid CSV file' });
				return;
			}

			// Get CSV headers
			const headers = Object.keys(csvData[0]);

			// Try to find mapping by filename (for data tables)
			let fileMapping = findMappingsForFilename(fileName);
			let category = 'data';

			// If not found and tableId is provided, try to find mapping for lookup table
			if (!fileMapping && tableId) {
				fileMapping = findMappingsForLookupTable(tableId);
				category = 'lookup';
			}

			// If still no mapping found
			if (!fileMapping) {
				fs.unlinkSync(filePath);
				res.status(400).json({
					error: 'No mapping found for this file',
					category: tableId ? 'lookup' : 'data',
					fileName,
					tableId: tableId || null
				});
				return;
			}

			// Process each destination
			const results = [];
			const errors = [];

			for (const destination of fileMapping.destinations) {
				// For lookup tables, only process the requested table
				if (category === 'lookup' && tableId && destination.tableId !== tableId) {
					continue;
				}

				try {
					// Map CSV data to DB format (handles row expansion automatically)
					const mappedData = mapCsvDataToDbData(csvData, destination);

					if (mappedData.length === 0) {
						results.push({
							tableName: destination.tableName,
							tableId: destination.tableId,
							success: true,
							message: 'No relevant data found for this table',
							totalRecords: 0,
							inserted: 0,
							updated: 0,
							skipped: 0,
							failed: 0
						});
						continue;
					}

					// Get the schema reference and primary keys
					const tableSchema = destination.schemaRef || getSchemaReference(destination.tableId);

					if (!tableSchema) {
						throw new Error(`Schema not found for table: ${destination.tableName}`);
					}

					// Import the data
					const importResult = await importData(
						tableSchema,
						destination.primaryKeys,
						mappedData,
						fileName,
						importedBy
					);
					console.log(`Import result for ${destination.tableName}:`, importResult);

					results.push({
						tableName: destination.tableName,
						tableId: destination.tableId,
						success: importResult.failed === 0,
						message: `Processed ${importResult.totalRecords} records`,
						totalRecords: importResult.totalRecords,
						inserted: importResult.inserted,
						updated: importResult.updated,
						skipped: importResult.skipped,
						failed: importResult.failed,
						errorDetails: importResult.errorDetails.length > 0
							? importResult.errorDetails.map(e => e.error)
							: undefined
					});
				} catch (error: any) {
					console.error(`Error importing to ${destination.tableName}:`, error);

					errors.push(`Error importing to ${destination.tableName}: ${error.message}`);

					results.push({
						tableName: destination.tableName,
						tableId: destination.tableId,
						success: false,
						message: error.message,
						totalRecords: 0,
						inserted: 0,
						updated: 0,
						skipped: 0,
						failed: 0
					});
				}
			}

			// Clean up the uploaded file
			fs.unlinkSync(filePath);

			// Return the results
			res.json({
				fileName,
				category,
				mappingDescription: fileMapping.description,
				results,
				errors: errors.length > 0 ? errors : undefined,
				success: results.some(r => r.success),
				timestamp: new Date().toISOString()
			});
		} catch (error: any) {
			// Clean up the file if it exists
			if (req.file?.path && fs.existsSync(req.file.path)) {
				fs.unlinkSync(req.file.path);
			}

			console.error(`Error in import process:`, error);
			res.status(500).json({
				error: 'Error processing import',
				message: error.message
			});
		}
	}
);

/**
 * Helper function to get schema reference by table ID
 */
function getSchemaReference(tableId: string): any {
	// Convert tableId (kebab-case) to schema property name (camelCase)
	const schemaName = tableId
		.split('-')
		.map((part, index) =>
			index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
		)
		.join('');

	return (schema as any)[schemaName];
}

// Zod schemas for OpenAPI documentation
const ImportResultSchema = z.object({
	tableName: z.string(),
	tableId: z.string(),
	success: z.boolean(),
	message: z.string(),
	totalRecords: z.number(),
	inserted: z.number(),
	updated: z.number(),
	skipped: z.number(),
	failed: z.number(),
	errorDetails: z.array(z.string()).optional()
}).openapi({ description: 'Import result for a table' });

const ImportResponseSchema = z.object({
	fileName: z.string(),
	category: z.union([z.literal('data'), z.literal('lookup')]),
	mappingDescription: z.string(),
	results: z.array(ImportResultSchema),
	errors: z.array(z.string()).optional(),
	success: z.boolean(),
	timestamp: z.string().datetime()
}).openapi({ description: 'CSV import process response' });

const importProcessSpec = {
	'/api/import/process': {
		post: {
			tags: ['Imports'],
			operationId: 'import_process_csv',
			description: 'Process and import a CSV file',
			requestBody: {
				content: {
					'multipart/form-data': {
						schema: z.object({
							file: z.any().openapi({ type: 'string', format: 'binary', description: 'CSV file to import' }),
							tableId: z.string().optional().openapi({ description: 'Table ID for lookup tables' }),
							importedBy: z.string().openapi({ description: 'User importing the data', example: 'admin' })
						})
					}
				}
			},
			responses: {
				'200': {
					description: 'Import processed successfully',
					content: {
						'application/json': {
							schema: ImportResponseSchema
						}
					}
				},
			}
		}
	}
};

export const importAPISpecs = {
	...importProcessSpec
};

export default router;