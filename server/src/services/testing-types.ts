import * as schema from "../db/schema"; // Import your database schema types here
import { convertDateMMDDYYYY } from "../utils/convertDates";
import { AnySQLiteTable } from "drizzle-orm/sqlite-core";
// First, create your types as we defined them
interface ColumnMapping {
	csvColumn: string;
	dbColumn: string;
	hasTransform?: boolean;
	transform?: (value: any) => any; // For the backend
}

/**
 * Function that transforms one CSV row into multiple DB rows
 */
export type RowExpanderFunction = (csvRow: Record<string, any>) => Record<string, any>[];


/**
 * Base interface for all destinations
 */
interface BaseDestination {
	tableName: string;
	tableId: string;
	primaryKeys: string[];
	columnMappings: ColumnMapping[];
	schemaRef: AnySQLiteTable; // For the backend, reference to schema
	rowExpander?: RowExpanderFunction;  // Optional function to expand one row into many
}

/**
 * Interface for data destinations
 */
interface DataDestination extends BaseDestination {
	category: "data";
}

/**
 * Interface for lookup destinations
 */
interface LookupDestination extends BaseDestination {
	category: "lookup";
}

/**
 * Union type for all destinations
 */
type Destination = DataDestination | LookupDestination;

/**
 * Base interface for all CSV mappings
 */
interface BaseCsvMapping {
	description: string;
	category: "data" | "lookup";
}

/**
 * Interface for data CSV mappings
 */
interface DataCsvMapping extends BaseCsvMapping {
	category: "data";
	filePatterns: RegExp[]; // Note: Using RegExp for backend
	multiTable?: boolean;
	destinations: Destination[];
}

/**
 * Interface for lookup CSV mappings
 */	
interface LookupCsvMapping extends BaseCsvMapping {
	category: "lookup";
	filePatterns?: RegExp[]; // Optional for lookup tables
	destination: LookupDestination;
}

/**
 * Union type for all CSV mappings
 */
type CSVFileMapping = DataCsvMapping | LookupCsvMapping;


export const csvFileMappings: CSVFileMapping[] = [
	// Example of a data mapping (Test Scores)
	{
		category: "data",
		filePatterns: [/reg_cuba_test_scores_\d+_\d+\.csv$/i],
		description: "Test scores data",
		destinations: [
			{
				category: "data",
				tableName: "Test Scores",
				tableId: "test-scores",
				primaryKeys: ["mnumber", "code", "date"],
				schemaRef: schema.testScores,
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

	// Example of another data mapping (Demographics with multiple destinations)
	{
		category: "data",
		filePatterns: [
			/reg_cuba_demographic_\d+_\d+\.csv$/i,
			/\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i
		],
		description: "Student demographic information",
		multiTable: true,
		destinations: [
			{
				category: "data",
				tableName: "Students",
				tableId: "students",
				primaryKeys: ["mnumber"],
				schemaRef: schema.students,
				columnMappings: [
					// Column mappings...
				]
			},
			{
				category: "data",
				tableName: "Student Addresses",
				tableId: "student-addresses",
				primaryKeys: ["mnumber", "type"],
				schemaRef: schema.studentAddresses,
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "mnumber" },

				],
			}
			// Other destinations...
		]
	},
];