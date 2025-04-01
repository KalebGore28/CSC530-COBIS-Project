// src/services/columnMappingService.ts

import { convertDateMMDDYYYY } from "../utils/convertDates";

/**
 * Interface for column mapping
 */
export interface ColumnMapping {
	csvColumn: string;    // Column name in CSV file
	dbColumn: string;     // Column name in database schema
	transform?: (value: any) => any;  // Optional transform function
}

/**
 * Interface for destination table configuration
 */
export interface DestinationTable {
	tableName: string;    // Display name of the table
	tableId: string;      // Unique identifier for the table (used for routing)
	primaryKeys: string[]; // Primary key fields for this table
	schemaRef?: any;      // Reference to the Drizzle schema if directly available
	columnMappings: ColumnMapping[];  // Explicit column mappings
}

/**
 * Interface for CSV file mapping configuration
 */
export interface CsvFileMapping {
	filePatterns: RegExp[];  // Patterns to match filenames
	description?: string;
	category: "lookup" | "data";
	destinations: DestinationTable[];  // Multiple destination tables for a single CSV
}

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
					{ csvColumn: "age", dbColumn: "age" },
					{ csvColumn: "cellphone", dbColumn: "cell_phone" }
				]
			},
			{
				tableName: "Student Programs",
				tableId: "student-programs",
				primaryKeys: ["studentId", "programCode"],
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "studentId" },
					{ csvColumn: "program", dbColumn: "programCode" },
					{ csvColumn: "levl", dbColumn: "level" },
					{ csvColumn: "major1", dbColumn: "primaryMajor" },
					{ csvColumn: "major1dept", dbColumn: "primaryMajorDept" },
					{ csvColumn: "major1coll", dbColumn: "primaryMajorCollege" },
					{ csvColumn: "major2", dbColumn: "secondaryMajor" },
					{ csvColumn: "major2dept", dbColumn: "secondaryMajorDept" },
					{ csvColumn: "major2coll", dbColumn: "secondaryMajorCollege" }
				]
			},
			{
				tableName: "Student Advisors",
				tableId: "student-advisors",
				primaryKeys: ["studentId", "advisorId"],
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "studentId" },
					{ csvColumn: "advnumb", dbColumn: "advisorId" },
					{ csvColumn: "advfname", dbColumn: "advisorFirstName" },
					{ csvColumn: "advlname", dbColumn: "advisorLastName" },
					{ csvColumn: "advmname", dbColumn: "advisorMiddleName" },
					{ csvColumn: "advsuffix", dbColumn: "advisorSuffix" }
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

	// Add lookup tables from original filePatternMap
	{
		filePatterns: [/reg_cuba_academic_standing_\d+_\d+\.csv$/i],
		description: "Academic standing codes",
		category: "lookup",
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
		filePatterns: [/reg_cuba_admit_codes_\d+_\d+\.csv$/i],
		description: "Admit type codes",
		category: "lookup",
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
	}
	// Add more file mappings here as needed
];

/**
 * Find all mappings for a filename
 */
export const findMappingsForFilename = (fileName: string): CsvFileMapping | null => {
	for (const mapping of csvFileMappings) {
		for (const pattern of mapping.filePatterns) {
			if (pattern.test(fileName)) {
				return mapping;
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
 */
export const mapCsvDataToDbData = (
	rows: Record<string, any>[],
	destinationTable: DestinationTable
): Record<string, any>[] => {
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
		destinations: mapping.destinations.map(destination => ({
			tableName: destination.tableName,
			tableId: destination.tableId,
			primaryKeys: destination.primaryKeys,
			columnCount: destination.columnMappings.length,
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

	if (lowerFilename.includes('academic') && lowerFilename.includes('stand')) {
		suggestions.push('Try: reg_cuba_academic_standing_YYYY_MM.csv');
	}

	if (lowerFilename.includes('admit')) {
		suggestions.push('Try: reg_cuba_admit_codes_YYYY_MM.csv');
	}

	if (suggestions.length === 0) {
		suggestions.push('Check the naming convention and ensure it matches one of the expected patterns');
	}

	return suggestions;
};