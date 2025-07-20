import { importMappedCSVData } from '../utils/import-data';
import { getDbConnection } from '../db/connection';
import { MappedCSVData } from './column-mapping-service';

/**
 * Service for handling data import operations
 */
export class ImportService {

	static async processImport(
		mappedData: MappedCSVData,
	) {
		await importMappedCSVData(await getDbConnection(), mappedData);
	}
} 