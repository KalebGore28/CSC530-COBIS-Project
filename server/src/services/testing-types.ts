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

interface BaseDestination {
	tableName: string;
	tableId: string;
	primaryKeys: string[];
	columnMappings: ColumnMapping[];
	hasRowExpander?: boolean;
	schemaRef: AnySQLiteTable; // For the backend, reference to schema
}

interface DataDestination extends BaseDestination {
	category: "data";
}

interface LookupDestination extends BaseDestination {
	category: "lookup";
}

type Destination = DataDestination | LookupDestination;

interface BaseCsvMapping {
	description: string;
	category: "data" | "lookup";
}

interface DataCsvMapping extends BaseCsvMapping {
	category: "data";
	filePatterns: RegExp[]; // Note: Using RegExp for backend
	multiTable?: boolean;
	destinations: Destination[];
}

interface LookupCsvMapping extends BaseCsvMapping {
	category: "lookup";
	filePatterns?: RegExp[]; // Optional for lookup tables
	destination: LookupDestination;
}

// Define the union type
type CsvFileMapping = DataCsvMapping | LookupCsvMapping;

// Now define the array that can hold both types
export const csvFileMappings: CsvFileMapping[] = [
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
				hasRowExpander: true
			}
			// Other destinations...
		]
	},
];