import { Request, Response } from 'express';
import { ImportService } from '../services/import-service';

import {
	mapCSVData,
	getMappingByName,
} from '../services/new-column-mapping-service';

/**
 * Controller for handling data import operations
 */
export class ImportController {
	/**
	 * Process and import a CSV file
	 */
	static async processImport(req: Request, res: Response) {
		try {
			const { csvData, mappingName } = req.body;

			// Get the mapping by name
			const columnMapping = getMappingByName(mappingName);
			
			if (!columnMapping) {
				return res.status(400).json({
					error: 'Invalid mapping name',
					message: `No mapping found for name: ${mappingName}`
				});
			}

			// Map the data
			const mappedData = columnMapping.category === 'data'
				? mapCSVData(csvData, columnMapping.destinations)
				: mapCSVData(csvData, columnMapping.destination);

			// Process the CSV import
			const result = await ImportService.processImport(mappingName, mappedData, columnMapping);

			// Return the results
			res.json(result);
			return;
		} catch (error: any) {
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
	static async getImportInfo(_req: Request, res: Response) {
		try {
			const importInfo = ImportService.getImportInfo();
			res.json(importInfo);
		} catch (error: any) {
			res.status(500).json({
				error: 'Error fetching import information',
				message: error.message
			});
		}
	}
} 