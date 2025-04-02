import express, { Request, Response } from 'express';
import { csvFileMappings } from '../../services/columnMappingService';


/**
 * Get available file patterns for data tables
 * @route GET /api/import/patterns
 * @group Imports - CSV data import operations
 * @returns {object} 200 - List of file patterns that match data tables
 * @returns {Error} 500 - Server error
*/
const router = express.Router();
router.get('/patterns', async (req: Request, res: Response) => {
	try {
		// Extract only data table patterns (not lookup tables)
		const patterns = csvFileMappings
			.filter(mapping => mapping.category === 'data')
			.map(mapping => ({
				filePatterns: mapping.filePatterns.map(pattern => pattern.toString()),
				description: mapping.description || '',
				// Generate examples for each file pattern
				examples: mapping.filePatterns.map(pattern => generateExample(pattern.toString())),
				destinations: mapping.destinations.map(dest => ({
					tableName: dest.tableName,
					tableId: dest.tableId
				}))
			}));

		res.json({
			patterns,
			count: patterns.length
		});
	} catch (error: any) {
		console.error('Error fetching file patterns:', error);
		res.status(500).json({
			error: 'Error fetching file patterns',
			message: error.message
		});
	}
});

/**
 * Generate a user-friendly example based on a regex pattern
 */
function generateExample(patternStr: string): string {
	// Convert regex to a human-readable example
	// This is simplified - you can enhance this based on your specific patterns
	let example = patternStr
		.replace(/^\//g, '')
		.replace(/\/i$/g, '')
		.replace(/\\d\+/g, '2023')
		.replace(/\\\./g, '.')
		.replace(/\\\//g, '/');

	// For common patterns in your system
	if (example.includes('reg_cuba_test_scores')) {
		return 'reg_cuba_test_scores_2023_04.csv';
	} else if (example.includes('reg_cuba_demographic')) {
		return 'reg_cuba_demographic_2023_04.csv';
	} else if (example.includes('REG_CUBA_Courses_Grade_Time_Extract')) {
		return '202304_REG_CUBA_Courses_Grade_Time_Extract_20230615.csv';
	}

	return example;
}

export default router;