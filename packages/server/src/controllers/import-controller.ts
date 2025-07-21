import { Request, Response } from 'express';
import { ImportService } from '../services/import-service';

import {
	mapCSVData,
	getMappingByName,
	getMappingByFilePattern,
	schemaRefToMetadata,
	getAllLookupMappingNames
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

	static async getMappingByName(req: Request, res: Response) {
		try {
			const { mappingName } = req.body;

			const rawMapping = getMappingByName(mappingName);

			const mapping = (() => {
				if (!rawMapping) return null;

				const copied = {
					...rawMapping,
					destinations: undefined,
					destination: undefined,
				};

				if (rawMapping.category === 'data') {
					// @ts-ignore
					copied.destinations = rawMapping.destinations.map(dest => ({
						...dest,
						schemaRef: schemaRefToMetadata(dest.schemaRef),
					}));
				} else if (rawMapping.category === 'lookup') {
					// @ts-ignore
					copied.destination = {
						...rawMapping.destination,
						schemaRef: schemaRefToMetadata(rawMapping.destination.schemaRef),
					};
				}

				return copied;
			})();

			res.status(200).json({
				message: 'Mapping retrieved successfully',
				result: mapping
			});
		} catch (error: any) {
			res.status(500).json({
				error: 'Error retrieving mapping',
				message: error.message
			});
			return;
		}
	}

	static async getMappingByFilePattern(req: Request, res: Response) {
		try {
			const { fileName } = req.body;

			// Get original mapping (shared reference)
			const rawMapping = getMappingByFilePattern(fileName);

			// Create a new object that copies and transforms schemaRefs to metadata
			const mapping = (() => {
				if (!rawMapping) return null;

				const copied = {
					...rawMapping,
					destinations: undefined,
					destination: undefined,
				};

				if (rawMapping.category === 'data') {
					// @ts-ignore
					copied.destinations = rawMapping.destinations.map(dest => ({
						...dest,
						schemaRef: schemaRefToMetadata(dest.schemaRef),
					}));
				} else if (rawMapping.category === 'lookup') {
					// @ts-ignore
					copied.destination = {
						...rawMapping.destination,
						schemaRef: schemaRefToMetadata(rawMapping.destination.schemaRef),
					};
				}

				return copied;
			})();

			res.status(200).json({
				message: 'Mapping retrieved successfully',
				result: mapping
			});
		} catch (error: any) {
			res.status(500).json({
				error: 'Error retrieving mapping',
				message: error.message
			});
		}
	}

	static async getAllLookupMappingNames(_: Request, res: Response) {
		try {
			const mappings = getAllLookupMappingNames();
			res.status(200).json({
				message: 'Lookup mappings retrieved successfully',
				result: mappings
			});
		} catch (error: any) {
			res.status(500).json({
				error: 'Error retrieving lookup mappings',
				message: error.message
			});
		}
	}
} 