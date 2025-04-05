import { Request, Response } from 'express';
import fs from 'fs';
import { ImportService } from '../services/import-service';

/**
 * Controller for handling data import operations
 */
export class ImportController {
	/**
	 * Process and import a CSV file
	 */
	static async processImport(req: Request, res: Response) {
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
			const category = req.body.category; // Optional category

			try {
				// Process the CSV import
				const result = await ImportService.processImport(
					filePath,
					fileName,
					importedBy,
					tableId
				);

				// Return the results
				res.json(result);
				return;
			} catch (error: any) {
				console.error(`Error in import process:`, error);

				// Return a more detailed error response
				res.status(400).json({
					error: error.message,
					category: tableId ? 'lookup' : 'data',
					fileName,
					tableId: tableId || null
				});
				return;
			} finally {
				// Clean up the uploaded file
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath);
				}
			}
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
			return;
		}
	}

	/**
	 * Get all available import tables with their metadata
	 */
	static async getImportTables(req: Request, res: Response) {
		try {
			const tables = ImportService.getImportTables();
			res.json(tables);
			return;
		} catch (error: any) {
			console.error('Error fetching import tables:', error);
			res.status(500).json({
				error: 'Error fetching import tables',
				message: error.message
			});
		}
	}

	/**
	 * Get available file patterns for data tables
	 */
	static async getImportPatterns(req: Request, res: Response) {
		try {
			const patterns = ImportService.getImportPatterns();
			res.json(patterns);
			return;
		} catch (error: any) {
			console.error('Error fetching import patterns:', error);
			res.status(500).json({
				error: 'Error fetching import patterns',
				message: error.message
			});
		}
	}

	/**
	 * Validate CSV headers against expected columns for a table
	 */
	static async validateCsvColumns(req: Request, res: Response) {
		try {
			const { tableId, csvHeaders } = req.body;

			// Validate request parameters
			if (!tableId || !csvHeaders || !Array.isArray(csvHeaders)) {
					res.status(400).json({
					error: 'Missing or invalid parameters',
					message: 'Both tableId and csvHeaders array are required'
				});
				return;
			}

			const validationResults = ImportService.validateCsvColumns(tableId, csvHeaders);
			res.json(validationResults);
			return;
		} catch (error: any) {
			console.error('Error validating CSV columns:', error);
			res.status(500).json({
				error: 'Error validating CSV columns',
				message: error.message
			});
		}
	}
} 