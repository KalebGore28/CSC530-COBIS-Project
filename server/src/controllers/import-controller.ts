import { Request, Response } from 'express';
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

			const { csvData, tableId, columnMapping } = req.body;

			console.log('Received CSV data:', csvData);
			console.log('Received tableId:', tableId);
			console.log('Received columnMapping:', columnMapping);
			return;



			// Check if file was uploaded
			if (!req.file) {
				res.status(400).json({ error: 'No file uploaded' });
				return;
			}

			// const importedBy = req.body.importedBy || 'system';
			// const category = req.body.category; // Optional category

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
	 * Get all import information including tables and file patterns
	 */
	static async getImportInfo(req: Request, res: Response) {
		try {
			const importInfo = ImportService.getImportInfo();
			res.json(importInfo);
		} catch (error: any) {
			console.error('Error fetching import information:', error);
			res.status(500).json({
				error: 'Error fetching import information',
				message: error.message
			});
		}
	}
} 