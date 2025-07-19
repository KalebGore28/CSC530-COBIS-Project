import { importMappedCSVData } from '../utils/new-import-data';
import { getDbConnection } from '../db/connection';

import {
	MappedCSVData,
} from '../services/new-column-mapping-service';


/**
 * Service for handling data import operations
 */
export class ImportService {

	static async processImport(
		mappedData: MappedCSVData,
	) {
		await importMappedCSVData(await getDbConnection(), mappedData);
	}

	/**
	 * Get all import information including tables and file patterns
	 * @returns Comprehensive import information
	 */
	// static getImportInfo() {
	// 	// Use the method from column-mapping-service to ensure consistency
	// 	const { csvMappings, stats } = getImportInfo();

	// 	return {
	// 		csvMappings,
	// 		stats
	// 	};
	// }
} 