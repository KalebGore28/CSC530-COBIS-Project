// src/services/columnMappingService.ts
import { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import * as schema from "../db/schema"; // Import your database schema types here

// A comprehensive service for mapping CSV data to database tables
// Supports both data tables (with strict file naming patterns) and
// Lookup tables (with more flexible naming but requiring explicit designation)

import { convertDateMMDDYYYY, convertDateDDMMYYYY } from "../utils/convertDates";
import { parseTermCode } from "../utils/convertTermCode";
import { parseCourseCode } from "../utils/convertCourseCode";

interface ColumnMapping {
	csvColumn: string;
	dbColumn: string;
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
	schemaRef: AnySQLiteTable;
	rowExpander?: RowExpanderFunction;
}

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
export interface DataCsvMapping extends BaseCsvMapping {
	category: "data";
	filePatterns: RegExp[];
	destinations: BaseDestination[];
}

/**
 * Interface for lookup CSV mappings
 */
export interface LookupCsvMapping extends BaseCsvMapping {
	category: "lookup";
	filePatterns?: RegExp[];
	destination: BaseDestination;
}

/**
 * Union type for all CSV mappings
 */
export type CSVFileMapping = DataCsvMapping | LookupCsvMapping;

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
			college: '' // Minors don't have college assignments
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
			college: '' // Minors don't have college assignments
		});
	}

	return results;
};

// Function that expands a single demographic row into multiple address rows
export const expandStudentAddresses = (row: Record<string, any>): Record<string, any>[] => {
	const results: Record<string, any>[] = [];
	const { year, term, valid } = parseTermCode(row.term || '');

	if (!valid || !row.mnumber) {
		return results; // Skip invalid rows
	}

	// Add home address if present
	if (row.homestreet1 || row.homecity || row.homestate || row.homezip) {
		results.push({
			mnumber: row.mnumber,
			term: term,
			year: year,
			type: 'HOME',
			street1: row.homestreet1 || '',
			street2: row.homestreet2 || '',
			city: row.homecity || '',
			state: row.homestate || '',
			zip: row.homezip || '',
			nation_code: row.homenation || 'USA',
			phone: row.homephone || ''
		});
	}

	// Add local address if present and different from home address
	if (row.locstreet1 || row.loccity || row.locstate || row.loczip) {
		// Check if local address is actually different from home address
		const isSameAsHome =
			row.locstreet1 === row.homestreet1 &&
			row.locstreet2 === row.homestreet2 &&
			row.loccity === row.homecity &&
			row.locstate === row.homestate &&
			row.loczip === row.homezip;

		if (!isSameAsHome) {
			results.push({
				mnumber: row.mnumber,
				term: term,
				year: year,
				type: 'LOCAL',
				street1: row.locstreet1 || '',
				street2: row.locstreet2 || '',
				city: row.loccity || '',
				state: row.locstate || '',
				zip: row.loczip || '',
				nation_code: row.locnation || 'USA',
				phone: row.locphone || ''
			});
		}
	}

	return results;
};

/**
 * Complete mapping configuration for all CSV files
 */
export const csvFileMappings: CSVFileMapping[] = [
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
				schemaRef: schema.students,
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
					{ csvColumn: "cellphone", dbColumn: "cell_phone" },
					{ csvColumn: "msuemail", dbColumn: "email" }
				]
			},
			{
				tableName: "Student Addresses",
				tableId: "student-addresses",
				primaryKeys: ["mnumber", "type"],
				schemaRef: schema.studentAddresses,
				// These mappings are used for validation, but the actual transformation happens in rowExpander
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "mnumber" },
					{ csvColumn: "term", dbColumn: "term", transform: (value) => parseTermCode(value).term },
					{ csvColumn: "term", dbColumn: "year", transform: (value) => parseTermCode(value).year },
					// { csvColumn: "type", dbColumn: "type" },
					// Include both home and local address fields for validation
					{ csvColumn: "homestreet1", dbColumn: "street1" },
					{ csvColumn: "homestreet2", dbColumn: "street2" },
					{ csvColumn: "homecity", dbColumn: "city" },
					{ csvColumn: "homestate", dbColumn: "state" },
					{ csvColumn: "homezip", dbColumn: "zip" },
					{ csvColumn: "homenation", dbColumn: "nation_code" },
					{ csvColumn: "homephone", dbColumn: "phone" },
					{ csvColumn: "locstreet1", dbColumn: "street1" },
					{ csvColumn: "locstreet2", dbColumn: "street2" },
					{ csvColumn: "loccity", dbColumn: "city" },
					{ csvColumn: "locstate", dbColumn: "state" },
					{ csvColumn: "loczip", dbColumn: "zip" },
					{ csvColumn: "locnation", dbColumn: "nation_code" },
					{ csvColumn: "locphone", dbColumn: "phone" }
				],
				// Use the row expander to create separate records for home and local addresses
				rowExpander: expandStudentAddresses
			},
			{
				tableName: "Student Academic Info",
				tableId: "student-academic-info",
				primaryKeys: ["mnumber"],
				schemaRef: schema.studentAcademicInfo,
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "mnumber" },
					{ csvColumn: "term", dbColumn: "term", transform: (value) => parseTermCode(value).term },
					{ csvColumn: "term", dbColumn: "year", transform: (value) => parseTermCode(value).year },
					{ csvColumn: "admitterm", dbColumn: "admit_term", transform: (value) => parseTermCode(value).term },
					{ csvColumn: "admitterm", dbColumn: "admit_year", transform: (value) => parseTermCode(value).year },
					{ csvColumn: "admitcode", dbColumn: "admit_code" },
					{ csvColumn: "acadstanding", dbColumn: "academic_standing" },
					{ csvColumn: "msuatthours", dbColumn: "msu_attempted_hours", transform: (value) => Number(value) },
					{ csvColumn: "msuearnhours", dbColumn: "msu_earned_hours", transform: (value) => Number(value) },
					{ csvColumn: "msuqp", dbColumn: "msu_quality_points", transform: (value) => Number(value) },
					{ csvColumn: "msugpa", dbColumn: "msu_gpa", transform: (value) => Number(value) },
					{ csvColumn: "overatthours", dbColumn: "overall_attempted_hours", transform: (value) => Number(value) },
					{ csvColumn: "overearnhours", dbColumn: "overall_earned_hours", transform: (value) => Number(value) },
					{ csvColumn: "overqp", dbColumn: "overall_quality_points", transform: (value) => Number(value) },
					{ csvColumn: "overgpa", dbColumn: "overall_gpa", transform: (value) => Number(value) }
				]
			},
			{
				tableName: "Student Programs",
				tableId: "student-programs",
				primaryKeys: ["mnumber", "type", "program"],
				schemaRef: schema.studentPrograms,
				// We're using a row expander instead of direct column mappings for this table
				columnMappings: [
					// These mappings are used for validation, but the actual transformation happens in rowExpander
					{ csvColumn: "term", dbColumn: "term", transform: (value) => parseTermCode(value).term },
					{ csvColumn: "term", dbColumn: "year", transform: (value) => parseTermCode(value).year },
					// { csvColumn: "type", dbColumn: "type" },
					{ csvColumn: "level", dbColumn: "level" },
					{ csvColumn: "program", dbColumn: "program" },
				],
				// This is the key addition - a function that transforms one CSV row into multiple DB rows
				rowExpander: expandStudentPrograms
			},
			{
				tableName: "Student Advisors",
				tableId: "student-advisors",
				primaryKeys: ["student_mnumber", "advisor_mnumber"],
				schemaRef: schema.studentAdvisors,
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
				primaryKeys: ["mnumber", "term", "year", "crn"],
				schemaRef: schema.studentCourses,
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "mnumber" },
					{ csvColumn: "term", dbColumn: "term", transform: (value) => parseTermCode(value).term },
					{ csvColumn: "term", dbColumn: "year", transform: (value) => parseTermCode(value).year },
					{ csvColumn: "partofterm", dbColumn: "part_of_term" },
					{ csvColumn: "crn", dbColumn: "crn" },
					{ csvColumn: "crsesubj", dbColumn: "course_subject" },
					{ csvColumn: "crsenumb", dbColumn: "course_number" },
					// For some reason the courses_during_term file doesn't have a suffix column
					{ csvColumn: "section", dbColumn: "course_section" },
					{ csvColumn: "crhrs", dbColumn: "course_hours", transform: (value) => Number(value) },
					{ csvColumn: "levlcode", dbColumn: "course_level" },
					{ csvColumn: "rstscode", dbColumn: "registration_status" },
					{ csvColumn: "insmcode", dbColumn: "instructional_method" },
					{ csvColumn: "lastattend", dbColumn: "last_attendance", transform: (value) => value ? convertDateMMDDYYYY(value) : null },
					{ csvColumn: "midgrade", dbColumn: "midterm_grade" },
					{ csvColumn: "fingrade", dbColumn: "final_grade" },
				]
			},
			{
				tableName: "Instructor Courses",
				tableId: "instructor-courses",
				primaryKeys: ["mnumber", "term", "year", "crn"],
				schemaRef: schema.instructorCourses,
				columnMappings: [
					{ csvColumn: "instmnumber", dbColumn: "mnumber" },
					{ csvColumn: "term", dbColumn: "term", transform: (value) => parseTermCode(value).term },
					{ csvColumn: "term", dbColumn: "year", transform: (value) => parseTermCode(value).year },
					{ csvColumn: "crn", dbColumn: "crn" },
					{ csvColumn: "crsesubj", dbColumn: "course_subject" },
					{ csvColumn: "crsenumb", dbColumn: "course_number" },
					{ csvColumn: "section", dbColumn: "course_section" },
				]

			},
			{
				/**
				 * This table exists solely to be as a fallback for instructor/faculty names.
				 * Why: If an instructor has not signed in to the system before, their name will not be in the
				 * user table. This table is used to store instructor names for those instructors.
				 */
				tableName: "Faculty",
				tableId: "faculty",
				primaryKeys: ["mnumber"],
				schemaRef: schema.faculty,
				columnMappings: [
					{ csvColumn: "instmnumber", dbColumn: "mnumber" },
					{ csvColumn: "instfirstnm", dbColumn: "first_name" },
					{ csvColumn: "instlastnm", dbColumn: "last_name" }
				]
			}
		]
	},

	// Previous Colleges CSV
	{
		filePatterns: [/reg_cuba_previous_colleges_\d+_\d+\.csv$/i],
		description: "Previous colleges attended",
		category: "data",
		destinations: [
			{
				tableName: "Previous Colleges",
				tableId: "previous-colleges",
				primaryKeys: ["mnumber", "college_code"],
				schemaRef: schema.previousColleges,
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "mnumber" },
					{ csvColumn: "collegecode", dbColumn: "college_code" },
					{ csvColumn: "collegedesc", dbColumn: "college_description" },
					{ csvColumn: "degree", dbColumn: "degree" },
					{ csvColumn: "degreedate", dbColumn: "date", transform: (value) => convertDateDDMMYYYY(value) } // Notice different date format according to Data Dictionary File.
				]
			}
		]
	},

	// Overrides CSV
	{
		filePatterns: [/reg_cuba_overrides_\d+_\d+\.csv$/i],
		description: "Overrides data",
		category: "data",
		destinations: [
			{
				tableName: "Overrides",
				tableId: "overrides",
				primaryKeys: ["mnumber", "term", "year", "crn"],
				schemaRef: schema.overrides,
				columnMappings: [
					{ csvColumn: "mnumber", dbColumn: "mnumber" },
					{ csvColumn: "term", dbColumn: "term", transform: (value) => parseTermCode(value).term },
					{ csvColumn: "term", dbColumn: "year", transform: (value) => parseTermCode(value).year },
					{ csvColumn: "crn", dbColumn: "crn" },
					{ csvColumn: "subj", dbColumn: "course_subject" },
					{ csvColumn: "crsenumb", dbColumn: "course_number" },
					// Again the suffix column is not present in the overrides file
					{ csvColumn: "section", dbColumn: "course_section" },
					{ csvColumn: "override", dbColumn: "override_type" },
					{ csvColumn: "userid", dbColumn: "granted_by" },
					{ csvColumn: "activitydate", dbColumn: "override_date", transform: (value) => convertDateDDMMYYYY(value) } // Notice different date format according to Data Dictionary File.
				]
			}
		]
	},

	// Courses Catalog CSV example file name: reg_cuba_catalog_202510_20250117.csv
	{
		filePatterns: [/reg_cuba_catalog_\d+_\d+\.csv$/i],
		description: "Courses catalog data",
		category: "data",
		destinations: [
			{
				tableName: "Courses Catalog",
				tableId: "courses-catalog",
				primaryKeys: ["subject", "number", "suffix"],
				schemaRef: schema.courses,
				columnMappings: [
					{ csvColumn: "course", dbColumn: "subject", transform: (value) => parseCourseCode(value).subject },
					{ csvColumn: "course", dbColumn: "number", transform: (value) => parseCourseCode(value).number },
					{ csvColumn: "course", dbColumn: "suffix", transform: (value) => parseCourseCode(value).suffix },
					{ csvColumn: "crsetitle", dbColumn: "title" },
					{ csvColumn: "crhrs", dbColumn: "hours", transform: (value) => Number(value) },
					{ csvColumn: "course_fee", dbColumn: "fee", transform: (value) => value === 'NULL' ? 0 : Number(value) },
					{ csvColumn: "web_fee", dbColumn: "web_fee", transform: (value) => value === 'NULL' ? 0 : Number(value) },
					{ csvColumn: "lastChanged", dbColumn: "last_updated", transform: (value) => value === 'NULL' ? new Date().toISOString() : new Date(value).toISOString() } // Notice different date format according to Data Dictionary File.
				]
			}
		]
	},



	// Lookup tables
	{
		filePatterns: [/academic.+standing|standing.+academic/i],
		description: "Academic standing codes",
		category: "lookup",
		destination: {
			tableName: "Academic Standing",
			tableId: "academic-standing",
			primaryKeys: ["code"],
			schemaRef: schema.academicStanding,
			columnMappings: [
				{ csvColumn: "code", dbColumn: "code" },
				{ csvColumn: "description", dbColumn: "description" }
			]
		}
	},
	{
		filePatterns: [/admit.+code|code.+admit/i],
		description: "Admit type codes",
		category: "lookup",
		destination: {
			tableName: "Admit Codes",
			tableId: "admit-codes",
			primaryKeys: ["code"],
			schemaRef: schema.admitCodes,
			columnMappings: [
				{ csvColumn: "code", dbColumn: "code" },
				{ csvColumn: "description", dbColumn: "description" }
			]
		}
	},
	{
		filePatterns: [/college.+code|code.+college/i],
		description: "College codes",
		category: "lookup",
		destination: {
			tableName: "College Codes",
			tableId: "college-codes",
			primaryKeys: ["code"],
			schemaRef: schema.collegeCodes,
			columnMappings: [
				{ csvColumn: "code", dbColumn: "code" },
				{ csvColumn: "description", dbColumn: "description" }
			]
		}
	},
	{
		filePatterns: [/colleges/i],
		description: "Colleges data",
		category: "lookup",
		destination: {
			tableName: "Colleges",
			tableId: "colleges",
			primaryKeys: ["code"],
			schemaRef: schema.colleges,
			columnMappings: [
				{ csvColumn: "code", dbColumn: "code" },
				{ csvColumn: "description", dbColumn: "description" }
			]
		}

	},
	{
		filePatterns: [/departments/i],
		description: "Departments data",
		category: "lookup",
		destination: {
			tableName: "Departments",
			tableId: "departments",
			primaryKeys: ["code"],
			schemaRef: schema.departments,
			columnMappings: [
				{ csvColumn: "code", dbColumn: "code" },
				{ csvColumn: "description", dbColumn: "description" },
				{ csvColumn: "college", dbColumn: "college", transform: (value) => value === 'NULL' ? '0' : value }
			]
		}

	},
	{
		filePatterns: [/instructional.+method|method.+instructional/i],
		description: "Instructional method codes",
		category: "lookup",
		destination: {
			tableName: "Instructional Methods",
			tableId: "instructional-methods",
			primaryKeys: ["code"],
			schemaRef: schema.instructionalMethods,
			columnMappings: [
				{ csvColumn: "code", dbColumn: "code" },
				{ csvColumn: "description", dbColumn: "description" }
			]
		}
	},
	{
		filePatterns: [/nations/i],
		description: "Nations data",
		category: "lookup",
		destination: {
			tableName: "Nations",
			tableId: "nations",
			primaryKeys: ["code"],
			schemaRef: schema.nations,
			columnMappings: [
				{ csvColumn: "code", dbColumn: "code" },
				{ csvColumn: "description", dbColumn: "description" }
			]
		}
	},
	{
		filePatterns: [/part.+term|term.+part/i],
		description: "Part of term data",
		category: "lookup",
		destination: {
			tableName: "Part of Term",
			tableId: "part-of-term",
			primaryKeys: ["code"],
			schemaRef: schema.partOfTerm,
			columnMappings: [
				{ csvColumn: "code", dbColumn: "code" },
				{ csvColumn: "description", dbColumn: "description" }
			]
		}
	},
	{
		filePatterns: [/major.+minor|minor.+major/i],
		description: "Major/Minor programs data",
		category: "lookup",
		destination: {
			tableName: "Programs",
			tableId: "programs",
			primaryKeys: ["code"],
			schemaRef: schema.programs,
			columnMappings: [
				{ csvColumn: "code", dbColumn: "code" },
				{ csvColumn: "description", dbColumn: "description" },
				{ csvColumn: "cip_code", dbColumn: "cip_code" },
				{ csvColumn: "is_major", dbColumn: "is_major", transform: (value) => value === 'NULL' ? 0 : Number(value) },
				{ csvColumn: "is_minor", dbColumn: "is_minor", transform: (value) => value === 'NULL' ? 0 : Number(value) },
				{ csvColumn: "has_concentration", dbColumn: "has_concentration", transform: (value) => value === 'NULL' ? 0 : Number(value) },
				{ csvColumn: "is_discontinued", dbColumn: "is_discontinued", transform: (value) => value === 'NULL' ? 0 : Number(value) },
				{ csvColumn: "is_aacsb", dbColumn: "is_aacsb", transform: (value) => value === 'NULL' ? 0 : Number(value) },
				{ csvColumn: "department", dbColumn: "department", transform: (value) => value === 'NULL' ? '0000' : value },
				{ csvColumn: "college", dbColumn: "college", transform: (value) => value === 'NULL' ? '0' : value },
				{ csvColumn: "added_on", dbColumn: "added_on", transform: (value) => value === 'NULL' ? new Date().toISOString() : new Date(value).toISOString() } // Default to now if not provided
			]
		}
	},
	{
		filePatterns: [/registration.+status|status.+registration/i],
		description: "Registration status codes",
		category: "lookup",
		destination: {
			tableName: "Registration Status",
			tableId: "registration-status",
			primaryKeys: ["code"],
			schemaRef: schema.registrationStatus,
			columnMappings: [
				{ csvColumn: "code", dbColumn: "code" },
				{ csvColumn: "description", dbColumn: "description" }
			]
		}
	},
	{
		filePatterns: [/terms/i],
		description: "Terms data",
		category: "lookup",
		destination: {
			tableName: "Terms",
			tableId: "terms",
			primaryKeys: ["code"],
			schemaRef: schema.terms,
			columnMappings: [
				{ csvColumn: "code", dbColumn: "code" },
				{ csvColumn: "description", dbColumn: "description" }
			]
		}
	},
];

// Type alias for any destination table
type DestinationTable = BaseDestination;

/**
 * Get mapping by table ID
 */
export const getDestinationByTableId = (tableId: string): DestinationTable | null => {
	for (const mapping of csvFileMappings) {
		if (mapping.category === "data") {
			const found = mapping.destinations.find(d => d.tableId === tableId);
			if (found) return found;
		} else {
			if (mapping.destination.tableId === tableId) {
				return mapping.destination;
			}
		}
	}
	return null;
};

/**
 * Find mappings for a filename (for data tables)
 */
export const findMappingsForFilename = (fileName: string): DataCsvMapping | null => {
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
 * Find mapping for a lookup table by ID
 */
export const findMappingsForLookupTable = (tableId: string): LookupCsvMapping | null => {
	if (!tableId) return null;

	for (const mapping of csvFileMappings) {
		if (mapping.category === "lookup" && mapping.destination.tableId === tableId) {
			return mapping;
		}
	}
	return null;
};

/**
 * Process a CSV row for a specific destination table
 */
export const mapCsvRowToDbRow = (
	row: Record<string, any>,
	destination: DestinationTable
): Record<string, any> => {
	const result: Record<string, any> = {};

	for (const column of destination.columnMappings) {
		if (row[column.csvColumn] !== undefined) {
			try {
				result[column.dbColumn] = column.transform
					? column.transform(row[column.csvColumn])
					: row[column.csvColumn];
			} catch (error) {
				console.warn(`Transform error for column ${column.csvColumn} -> ${column.dbColumn}:`, error);
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
	destination: DestinationTable
): Record<string, any>[] => {
	if (destination.rowExpander) {
		return rows.flatMap(row => {
			try {
				return destination.rowExpander!(row);
			} catch (error) {
				console.warn(`Error expanding row for ${destination.tableName}:`, error);
				return [];
			}
		});
	}
	return rows.map(row => mapCsvRowToDbRow(row, destination))
		.filter(row => Object.keys(row).length > 0);
};

/**
 * Get all destination tables across all mappings
 */
export const getAllDestinationTables = (): DestinationTable[] => {
	const destinations: DestinationTable[] = [];

	for (const mapping of csvFileMappings) {
		if (mapping.category === "data") {
			destinations.push(...mapping.destinations);
		} else {
			destinations.push(mapping.destination);
		}
	}
	return destinations;
};

/**
 * Get CSV mapping metadata for frontend
 */
export const getImportInfo = () => {
	return {
		csvMappings: csvFileMappings.map(mapping => {
			const destinations = mapping.category === "data"
				? mapping.destinations
				: [mapping.destination];

			// Convert RegExp patterns to string format that can be reconstructed on the client
			const patternStrings = (mapping.filePatterns || [])
				.map(pattern => {
					// Get the actual pattern string and flags
					const patternStr = pattern.toString();
					// The regex toString() returns something like /pattern/flags
					// Extract just the pattern part and flags
					const match = /^\/(.*)\/([gimuy]*)$/.exec(patternStr);
					if (match) {
						const [_, patternBody, flags] = match;
						// Return as a string with slashes and flags that can be parsed on client
						return `/${patternBody}/${flags}`;
					}
					// Fallback to original string representation
					return patternStr;
				});

			return {
				filePatterns: patternStrings,
				description: mapping.description,
				category: mapping.category,
				destinations: mapping.category === "data"
					? mapping.destinations.map(dest => ({
						tableName: dest.tableName,
						tableId: dest.tableId,
						category: mapping.category,
						primaryKeys: dest.primaryKeys,
						hasRowExpander: !!dest.rowExpander,
						columns: dest.columnMappings.map(col => ({
							dbColumn: col.dbColumn,
							csvColumn: col.csvColumn,
							isPrimaryKey: dest.primaryKeys.includes(col.dbColumn),
							hasTransform: !!col.transform
						}))
					}))
					: undefined,
				destination: mapping.category === "lookup"
					? {
						tableName: mapping.destination.tableName,
						tableId: mapping.destination.tableId,
						category: mapping.category,
						primaryKeys: mapping.destination.primaryKeys,
						hasRowExpander: !!mapping.destination.rowExpander,
						columns: mapping.destination.columnMappings.map(col => ({
							dbColumn: col.dbColumn,
							csvColumn: col.csvColumn,
							isPrimaryKey: mapping.destination.primaryKeys.includes(col.dbColumn),
							hasTransform: !!col.transform
						}))
					}
					: undefined
			};
		}),

		stats: {
			csvMappingCount: csvFileMappings.length,
			dataTableCount: csvFileMappings.filter(m => m.category === "data").length,
			lookupTableCount: csvFileMappings.filter(m => m.category === "lookup").length
		}
	};
};