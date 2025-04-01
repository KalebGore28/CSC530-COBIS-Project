// src/services/columnMappingService.ts
//
// A comprehensive service for mapping CSV data to database tables
// Supports both data tables (with strict file naming patterns) and
// lookup tables (with more flexible naming but requiring explicit designation)

import { convertDateMMDDYYYY } from "../utils/convertDates";
import { parseTermCode } from "../utils/convertTermCode";

/**
 * Interface for column mapping
 */
export interface ColumnMapping {
	csvColumn: string;    // Column name in CSV file
	dbColumn: string;     // Column name in database schema
	transform?: (value: any) => any;  // Optional transform function
}

/**
 * Function that transforms one CSV row into multiple DB rows
 */
export type RowExpanderFunction = (csvRow: Record<string, any>) => Record<string, any>[];

/**
 * Interface for destination table configuration
 */
export interface DestinationTable {
	tableName: string;    // Display name of the table
	tableId: string;      // Unique identifier for the table (used for routing)
	primaryKeys: string[]; // Primary key fields for this table
	schemaRef?: any;      // Reference to the Drizzle schema if directly available
	columnMappings: ColumnMapping[];  // Explicit column mappings
	rowExpander?: RowExpanderFunction;  // Optional function to expand one row into many
}

/**
 * Interface for CSV file mapping configuration
 */
export interface CsvFileMapping {
	filePatterns: RegExp[];  // Patterns to match filenames (required for data tables, optional for lookup tables)
	description?: string;
	category: "lookup" | "data";
	requiresTableDesignation?: boolean; // If true, table must be explicitly specified for lookup tables
	expectedColumns?: string[]; // Expected column headers for lookup tables 
	destinations: DestinationTable[];  // Multiple destination tables for a single CSV
}

// Function that expands a single demographic row into multiple student program rows
export const expandStudentPrograms = (row: Record<string, any>): Record<string, any>[] => {
	const results: Record<string, any>[] = [];
	const { year, term, valid } = parseTermCode(row.term || '');

	if (!valid || !row.mnumber) {
		return results; // Skip invalid rows
	}

	const level = row.levl || 'UG'; // Default level if not provided

	// Add Major 1 if present
	if (row.major1) {
		results.push({
			mnumber: row.mnumber,
			term: term,
			year: year,
			type: 'MAJOR',
			level: level,
			program: row.major1,
			department: row.major1dept || '',
			college: row.major1coll || ''
		});
	}

	// Add Major 2 if present
	if (row.major2) {
		results.push({
			mnumber: row.mnumber,
			term: term,
			year: year,
			type: 'MAJOR',
			level: level,
			program: row.major2,
			department: row.major2dept || '',
			college: row.major2coll || ''
		});
	}

	// Add Minor 1 if present
	if (row.minor1) {
		results.push({
			mnumber: row.mnumber,
			term: term,
			year: year,
			type: 'MINOR',
			level: level,
			program: row.minor1,
			department: row.minor1dept || '',
			college: '' // Minors may not have college assignments
		});
	}

	// Add Minor 2 if present
	if (row.minor2) {
		results.push({
			mnumber: row.mnumber,
			term: term,
			year: year,
			type: 'MINOR',
			level: level,
			program: row.minor2,
			department: row.minor2dept || '',
			college: '' // Minors may not have college assignments
		});
	}

	return results;
};

/**
 * Complete mapping configuration for all CSV files
 */
export const csvFileMappings: CsvFileMapping[] = [
	// Test Scores CSV
	{
		filePatterns: [/reg_cuba_test_scores_\d+_\d+\.csv$/i],
		description: "Test scores data",
		category: "data",
		destinations: [
			{
				tableName: "Test Scores",
				tableId: "test-scores",
				primaryKeys: ["mnumber", "code", "date"],
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "mnumber" },
					{ csvColumn: "testcode", dbColumn: "code" },
					{ csvColumn: "testdesc", dbColumn: "description" },
					{ csvColumn: "testscore", dbColumn: "score", transform: (value) => Number(value) },
					{ csvColumn: "testdate", dbColumn: "date", transform: (value) => convertDateMMDDYYYY(value) }
				]
			}
		]
	},

	// Demographics CSV - Maps to multiple tables
	{
		filePatterns: [
			/reg_cuba_demographic_\d+_\d+\.csv$/i,
			/\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i
		],
		description: "Student demographic information",
		category: "data",
		destinations: [
			{
				tableName: "Students",
				tableId: "students",
				primaryKeys: ["mnumber"],
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "mnumber" },
					{ csvColumn: "firstname", dbColumn: "first_name" },
					{ csvColumn: "middlename", dbColumn: "middle_name" },
					{ csvColumn: "lastname", dbColumn: "last_name" },
					{ csvColumn: "suffix", dbColumn: "suffix" },
					{ csvColumn: "gender", dbColumn: "gender" },
					{ csvColumn: "birthdate", dbColumn: "birthdate", transform: (value) => convertDateMMDDYYYY(value) },
					{ csvColumn: "citizen", dbColumn: "citizenship" },
					{ csvColumn: "race", dbColumn: "race_code" },
					{ csvColumn: "racedesc", dbColumn: "race_description" },
					{ csvColumn: "residcode", dbColumn: "residency_code" },
					{ csvColumn: "residdesc", dbColumn: "residency_description" },
					{ csvColumn: "age", dbColumn: "age", transform: (value) => Number(value) },
					{ csvColumn: "cellphone", dbColumn: "cell_phone" }
				]
			},
			{
				tableName: "Student Addresses",
				tableId: "student-addresses",
				primaryKeys: ["mnumber", "type"],
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "mnumber" },
					{ csvColumn: "term", dbColumn: "term", transform: (value) => parseTermCode(value).term },
					{ csvColumn: "term", dbColumn: "year", transform: (value) => parseTermCode(value).year },
					{ csvColumn: "type", dbColumn: "type" },
					{ csvColumn: "street1", dbColumn: "street1" },
					{ csvColumn: "street2", dbColumn: "street2" },
					{ csvColumn: "city", dbColumn: "city" },
					{ csvColumn: "state", dbColumn: "state" },
					{ csvColumn: "zip", dbColumn: "zip" },
					{ csvColumn: "nation_code", dbColumn: "nation_code" },
					{ csvColumn: "phone", dbColumn: "phone" }
				]
			},
			{
				tableName: "Student Academic Info",
				tableId: "student-academic-info",
				primaryKeys: ["mnumber"],
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "mnumber" },
					{ csvColumn: "admit_term", dbColumn: "admit_term", transform: (value) => parseTermCode(value).term },
					{ csvColumn: "admit_year", dbColumn: "admit_year", transform: (value) => parseTermCode(value).year },
					{ csvColumn: "admit_code", dbColumn: "admit_code" },
					{ csvColumn: "standing", dbColumn: "academic_standing" },
					{ csvColumn: "msu_attempted_hours", dbColumn: "msu_attempted_hours", transform: (value) => Number(value) },
					{ csvColumn: "msu_earned_hours", dbColumn: "msu_earned_hours", transform: (value) => Number(value) },
					{ csvColumn: "msu_quality_points", dbColumn: "msu_quality_points", transform: (value) => Number(value) },
					{ csvColumn: "msu_gpa", dbColumn: "msu_gpa", transform: (value) => Number(value) },
					{ csvColumn: "overall_attempted_hours", dbColumn: "overall_attempted_hours", transform: (value) => Number(value) },
					{ csvColumn: "overall_earned_hours", dbColumn: "overall_earned_hours", transform: (value) => Number(value) },
					{ csvColumn: "overall_quality_points", dbColumn: "overall_quality_points", transform: (value) => Number(value) },
					{ csvColumn: "overall_gpa", dbColumn: "overall_gpa", transform: (value) => Number(value) }
				]
			},
			{
				tableName: "Student Programs",
				tableId: "student-programs",
				primaryKeys: ["mnumber", "type", "program"],
				// We're using a row expander instead of direct column mappings for this table
				columnMappings: [
					// These mappings are used for validation, but the actual transformation happens in rowExpander
					{ csvColumn: "term", dbColumn: "term", transform: (value) => parseTermCode(value).term },
					{ csvColumn: "term", dbColumn: "year", transform: (value) => parseTermCode(value).year },
					{ csvColumn: "type", dbColumn: "type" },
					{ csvColumn: "level", dbColumn: "level" },
					{ csvColumn: "program", dbColumn: "program" },
					{ csvColumn: "department", dbColumn: "department" },
					{ csvColumn: "college", dbColumn: "college" },
				],
				// This is the key addition - a function that transforms one CSV row into multiple DB rows
				rowExpander: expandStudentPrograms
			},
			{
				tableName: "Student Advisors",
				tableId: "student-advisors",
				primaryKeys: ["student_mnumber", "advisor_mnumber"],
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "student_mnumber" },
					{ csvColumn: "term", dbColumn: "term", transform: (value) => parseTermCode(value).term },
					{ csvColumn: "term", dbColumn: "year", transform: (value) => parseTermCode(value).year },
					{ csvColumn: "advnumb", dbColumn: "advisor_mnumber" },
				]
			}
		]
	},

	// Student/Instructor Courses CSV
	{
		filePatterns: [
			/reg_cuba_courses_during_term_\d+_\d+\.csv$/i,
			/\d+_REG_CUBA_Courses_Grade_Time_Extract_\d+\.csv$/i
		],
		description: "Courses taken during term",
		category: "data",
		destinations: [
			{
				tableName: "Student Courses",
				tableId: "student-courses",
				primaryKeys: ["studentId", "termCode", "crn"],
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "studentId" },
					{ csvColumn: "term", dbColumn: "termCode" },
					{ csvColumn: "partofterm", dbColumn: "partOfTerm" },
					{ csvColumn: "crn", dbColumn: "crn" },
					{ csvColumn: "crsesubj", dbColumn: "subject" },
					{ csvColumn: "crsenumb", dbColumn: "courseNumber" },
					{ csvColumn: "section", dbColumn: "section" },
					{ csvColumn: "crhrs", dbColumn: "creditHours", transform: (value) => Number(value) },
					{ csvColumn: "levlcode", dbColumn: "levelCode" },
					{ csvColumn: "rstscode", dbColumn: "registrationStatus" },
					{ csvColumn: "insmcode", dbColumn: "instructionalMethod" },
					{ csvColumn: "lastattend", dbColumn: "lastAttendance", transform: (value) => value ? convertDateMMDDYYYY(value) : null },
					{ csvColumn: "midgrade", dbColumn: "midtermGrade" },
					{ csvColumn: "fingrade", dbColumn: "finalGrade" },
					{ csvColumn: "instmnumber", dbColumn: "instructorId" }
				]
			}
		]
	},

	// Lookup tables - with less strict filename requirements but expected columns
	{
		filePatterns: [/academic.+standing|standing.+academic/i], // More flexible pattern
		description: "Academic standing codes",
		category: "lookup",
		requiresTableDesignation: true, // This lookup table requires explicit designation
		expectedColumns: ["code", "description"], // These columns must exist
		destinations: [
			{
				tableName: "Academic Standing",
				tableId: "academic-standing",
				primaryKeys: ["code"],
				columnMappings: [
					{ csvColumn: "code", dbColumn: "code" },
					{ csvColumn: "description", dbColumn: "description" }
				]
			}
		]
	},
	{
		filePatterns: [/admit.+code|code.+admit/i], // More flexible pattern
		description: "Admit type codes",
		category: "lookup",
		expectedColumns: ["code", "description"], // These columns must exist
		destinations: [
			{
				tableName: "Admit Codes",
				tableId: "admit-codes",
				primaryKeys: ["code"],
				columnMappings: [
					{ csvColumn: "code", dbColumn: "code" },
					{ csvColumn: "description", dbColumn: "description" }
				]
			}
		]
	},

	// Generic lookup table mapping for standard code/description pairs
	{
		filePatterns: [], // No specific file pattern - rely on column detection
		description: "Generic lookup table",
		category: "lookup",
		requiresTableDesignation: true, // Must specify which table this is
		expectedColumns: ["code", "description"],
		destinations: [
			{
				tableName: "College Codes",
				tableId: "college-codes",
				primaryKeys: ["code"],
				columnMappings: [
					{ csvColumn: "code", dbColumn: "code" },
					{ csvColumn: "description", dbColumn: "description" }
				]
			},
			{
				tableName: "Departments",
				tableId: "departments",
				primaryKeys: ["code"],
				columnMappings: [
					{ csvColumn: "code", dbColumn: "code" },
					{ csvColumn: "description", dbColumn: "description" }
				]
			},
			{
				tableName: "Instructional Methods",
				tableId: "instructional-methods",
				primaryKeys: ["code"],
				columnMappings: [
					{ csvColumn: "code", dbColumn: "code" },
					{ csvColumn: "description", dbColumn: "description" }
				]
			},
			{
				tableName: "Registration Status",
				tableId: "registration-status",
				primaryKeys: ["code"],
				columnMappings: [
					{ csvColumn: "code", dbColumn: "code" },
					{ csvColumn: "description", dbColumn: "description" }
				]
			}
		]
	}
	// Add more file mappings here as needed
];

/**
 * Find mappings for a filename (for data tables)
 */
export const findMappingsForFilename = (fileName: string): CsvFileMapping | null => {
	// First look for data tables with file patterns
	for (const mapping of csvFileMappings) {
		if (mapping.category === "data") {
			for (const pattern of mapping.filePatterns) {
				if (pattern.test(fileName)) {
					return mapping;
				}
			}
		}
	}
	return null;
};

/**
 * Find mappings for lookup tables based on column headers
 * @param headers CSV column headers
 * @param tableId Optional explicit table ID for lookup tables that require designation
 */
export const findMappingsForLookupTable = (
	headers: string[],
	tableId?: string
): CsvFileMapping | null => {
	// Convert headers to lowercase for case-insensitive comparison
	const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

	for (const mapping of csvFileMappings) {
		if (mapping.category === "lookup") {
			// If table designation is required and tableId is provided, match by tableId
			if (mapping.requiresTableDesignation && tableId) {
				const matchingDestination = mapping.destinations.find(d => d.tableId === tableId);
				if (matchingDestination) {
					return mapping;
				}
				continue;
			}

			// If table has expected columns, check if all required columns are present
			if (mapping.expectedColumns && mapping.expectedColumns.length > 0) {
				const missingColumns = mapping.expectedColumns.filter(
					col => !normalizedHeaders.includes(col.toLowerCase().trim())
				);

				// All expected columns are present
				if (missingColumns.length === 0) {
					return mapping;
				}
			} else {
				// Fallback to checking if the required columns for any destination are present
				for (const destination of mapping.destinations) {
					const requiredColumns = destination.columnMappings.map(c => c.csvColumn.toLowerCase().trim());
					const missingColumns = requiredColumns.filter(
						col => !normalizedHeaders.includes(col)
					);

					if (missingColumns.length === 0) {
						return mapping;
					}
				}
			}
		}
	}

	return null;
};

/**
 * Process a CSV row for a specific destination table
 */
export const mapCsvRowToDbRow = (
	row: Record<string, any>,
	destinationTable: DestinationTable
): Record<string, any> => {
	const result: Record<string, any> = {};

	for (const column of destinationTable.columnMappings) {
		if (row[column.csvColumn] !== undefined) {
			// Apply transform if exists, otherwise use the raw value
			try {
				result[column.dbColumn] = column.transform
					? column.transform(row[column.csvColumn])
					: row[column.csvColumn];
			} catch (error) {
				console.warn(`Transform error for column ${column.csvColumn} -> ${column.dbColumn}:`, error);
				// Keep the original value if transform fails
				result[column.dbColumn] = row[column.csvColumn];
			}
		}
	}

	return result;
};

/**
 * Process multiple CSV rows for a specific destination table
 * Now supports row expansion for one-to-many transformations
 */
export const mapCsvDataToDbData = (
	rows: Record<string, any>[],
	destinationTable: DestinationTable
): Record<string, any>[] => {
	// If we have a row expander function, use it
	if (destinationTable.rowExpander) {
		// Apply the row expander to each CSV row and flatten the results
		return rows.flatMap(row => {
			try {
				return destinationTable.rowExpander!(row);
			} catch (error) {
				console.warn(`Error expanding row for ${destinationTable.tableName}:`, error);
				return []; // Skip this row if expansion fails
			}
		});
	}

	// Otherwise, use the standard mapping approach
	return rows.map(row => mapCsvRowToDbRow(row, destinationTable))
		.filter(row => Object.keys(row).length > 0);
};

/**
 * Get all available file mappings
 */
export const getAllFileMappings = (): CsvFileMapping[] => {
	return csvFileMappings;
};

/**
 * Get mapping by table name
 */
export const getMappingsForTableName = (tableName: string): DestinationTable[] => {
	const result: DestinationTable[] = [];

	for (const fileMapping of csvFileMappings) {
		for (const destination of fileMapping.destinations) {
			if (destination.tableName === tableName) {
				result.push(destination);
			}
		}
	}

	return result;
};

/**
 * Get mapping by table ID
 */
export const getDestinationByTableId = (tableId: string): DestinationTable | null => {
	for (const fileMapping of csvFileMappings) {
		for (const destination of fileMapping.destinations) {
			if (destination.tableId === tableId) {
				return destination;
			}
		}
	}
	return null;
};

/**
 * Get all destination tables across all file mappings
 */
export const getAllDestinationTables = (): DestinationTable[] => {
	const result: DestinationTable[] = [];

	for (const fileMapping of csvFileMappings) {
		for (const destination of fileMapping.destinations) {
			result.push(destination);
		}
	}

	return result;
};

/**
 * Get metadata for CSV to table mappings for frontend/API use
 */
export const getImportMetadata = (includeColumnMappings = false) => {
	return getAllFileMappings().map(mapping => ({
		filePatterns: mapping.filePatterns.map(pattern => pattern.toString()),
		description: mapping.description || '',
		category: mapping.category,
		requiresTableDesignation: mapping.requiresTableDesignation || false,
		expectedColumns: mapping.expectedColumns || [],
		destinations: mapping.destinations.map(destination => ({
			tableName: destination.tableName,
			tableId: destination.tableId,
			primaryKeys: destination.primaryKeys,
			columnCount: destination.columnMappings.length,
			usesRowExpander: !!destination.rowExpander,
			// Only include column mapping details if explicitly requested
			columnMappings: includeColumnMappings
				? destination.columnMappings.map(col => ({
					csvColumn: col.csvColumn,
					dbColumn: col.dbColumn,
					hasTransform: !!col.transform
				}))
				: undefined
		}))
	}));
};

/**
 * Generate helpful example filenames for each pattern
 */
export const generatePatternExamples = (): Record<string, string[]> => {
	const examples: Record<string, string[]> = {};

	getAllFileMappings().forEach(mapping => {
		mapping.filePatterns.forEach(pattern => {
			const patternStr = pattern.toString();

			// Clean up the RegExp string for display
			const cleanPattern = patternStr
				.replace(/^\//g, '')
				.replace(/\/i$/g, '')
				.replace(/\\d\+/g, '2023')
				.replace(/\\\./g, '.')
				.replace(/\\\//g, '/');

			// Generate an example based on the pattern
			let example = cleanPattern;

			// For the common patterns in your system
			if (cleanPattern.includes('reg_cuba_test_scores')) {
				example = 'reg_cuba_test_scores_2023_04.csv';
			} else if (cleanPattern.includes('reg_cuba_demographic')) {
				example = 'reg_cuba_demographic_2023_04.csv';
			} else if (cleanPattern.includes('REG_CUBA_Courses_Grade_Time_Extract')) {
				example = '202304_REG_CUBA_Courses_Grade_Time_Extract_20230615.csv';
			}

			examples[patternStr] = [example];
		});
	});

	return examples;
};

/**
 * Suggest possible patterns for a filename that doesn't match
 */
export const suggestPossiblePatterns = (filename: string): string[] => {
	// Extract key parts from the filename
	const lowerFilename = filename.toLowerCase();
	const suggestions = [];

	// For data tables (strict naming conventions)
	if (lowerFilename.includes('test') && lowerFilename.includes('score')) {
		suggestions.push('Try: reg_cuba_test_scores_YYYY_MM.csv');
	}

	if (lowerFilename.includes('demo') || lowerFilename.includes('student')) {
		suggestions.push('Try: reg_cuba_demographic_YYYY_MM.csv');
	}

	if (lowerFilename.includes('course')) {
		suggestions.push('Try: reg_cuba_courses_during_term_YYYY_MM.csv');
		suggestions.push('Try: YYYYMM_REG_CUBA_Courses_Grade_Time_Extract_YYYYMMDD.csv');
	}

	// For lookup tables (more flexible naming)
	if (lowerFilename.includes('academic') && lowerFilename.includes('stand')) {
		suggestions.push('For lookup tables: Please specify the table type when uploading');
		suggestions.push('Ensure columns include at least: "code" and "description"');
	}

	if (lowerFilename.includes('admit') || lowerFilename.includes('code')) {
		suggestions.push('For lookup tables: Please specify the table type when uploading');
		suggestions.push('Ensure columns include at least: "code" and "description"');
	}

	if (suggestions.length === 0) {
		suggestions.push('For data tables: Check the naming convention follows the expected pattern');
		suggestions.push('For lookup tables: Specify the table type when uploading');
	}

	return suggestions;
};

/**
 * Check if headers match the minimum required columns for a table
 * @param headers The CSV headers to check
 * @param tableId The specific table ID to check against
 */
export const validateHeadersForTable = (headers: string[], tableId: string): {
	valid: boolean;
	missingColumns: string[];
	tableInfo?: DestinationTable;
} => {
	const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
	const destinationTable = getDestinationByTableId(tableId);

	if (!destinationTable) {
		return {
			valid: false,
			missingColumns: [],
		};
	}

	const requiredColumns = destinationTable.columnMappings.map(c =>
		c.csvColumn.toLowerCase().trim()
	);

	const missingColumns = requiredColumns.filter(
		col => !normalizedHeaders.includes(col)
	);

	return {
		valid: missingColumns.length === 0,
		missingColumns,
		tableInfo: destinationTable
	};
};

/**
 * Detect which table a CSV most likely matches based on its headers
 * Useful for lookup tables without strict naming patterns
 */
export const detectTableFromHeaders = (headers: string[]): {
	possibleTables: { tableId: string, tableName: string, matchPercentage: number }[];
	suggestedTableId: string | null;
} => {
	const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
	const result: { tableId: string, tableName: string, matchPercentage: number }[] = [];

	// Check all destination tables
	for (const mapping of csvFileMappings) {
		for (const destination of mapping.destinations) {
			const requiredColumns = destination.columnMappings.map(c =>
				c.csvColumn.toLowerCase().trim()
			);

			const matchingColumns = requiredColumns.filter(
				col => normalizedHeaders.includes(col)
			);

			const matchPercentage = (matchingColumns.length / requiredColumns.length) * 100;

			// Only include if it's a reasonable match (at least 50%)
			if (matchPercentage >= 50) {
				result.push({
					tableId: destination.tableId,
					tableName: destination.tableName,
					matchPercentage
				});
			}
		}
	}

	// Sort by match percentage (highest first)
	result.sort((a, b) => b.matchPercentage - a.matchPercentage);

	// Consider it a definitive match if > 90% match and significantly better than second place
	const suggestedTableId = result.length > 0 &&
		result[0].matchPercentage > 90 &&
		(result.length === 1 || (result[0].matchPercentage - result[1].matchPercentage > 20))
		? result[0].tableId
		: null;

	return {
		possibleTables: result,
		suggestedTableId
	};
};