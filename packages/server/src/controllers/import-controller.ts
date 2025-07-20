import { Request, Response } from 'express';
import { ImportService } from '../services/import-service';

import {
	mapCSVData,
	getMappingByName,
} from '../services/column-mapping-service';

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
				res.status(400).json({
					error: 'Invalid mapping name',
					message: `No mapping found for name: ${mappingName}`
				});
				return;
			}

			// Map the data
			const mappedData = columnMapping.category === 'data'
				? mapCSVData(csvData, columnMapping.destinations)
				: mapCSVData(csvData, columnMapping.destination);

			// Process the CSV import
			const result = await ImportService.processImport(mappedData);

			// Return the results
			res.status(200).json({
				message: 'Import processed successfully',
				result: result
			});
			return;
		} catch (error: any) {
			res.status(500).json({
				error: 'Error processing import',
				message: error.message
			});
			return;
		}
	}
} 