import { Request, Response } from 'express';
import { ImportService } from '../services/import-service';
import { getLookupTableByTableId } from '../services/column-mapping-service';

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

			let _columnMapping = columnMapping;

			// If columnMapping is not provided, try to find it based on the tableId
			if (!_columnMapping && tableId) {
				_columnMapping = getLookupTableByTableId(tableId);
			}

			try {
				// Process the CSV import
				const result = await ImportService.processImport(
					csvData,
					_columnMapping,
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
					tableId: tableId || null
				});
				return;
			}
		} catch (error: any) {
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