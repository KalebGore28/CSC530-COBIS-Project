import { MySqlTable } from "drizzle-orm/mysql-core";
import { format } from 'date-fns';
import * as schema from "../db/schema";

import {
    loadPrefixMap,
    getPrefixMap,
    updatePrefixMap,
} from '../utils/prefixMap';

await loadPrefixMap().catch(err => {
    console.error("Error loading prefix map:", err);
});


// --- TYPE DEFINITIONS ---

/**
 * Base interface for column mapping
 */
interface ColumnMap {
    csvColumn: string;
    dbColumn: string;
    transform?: (value: any) => any; // For the backend
}

/**
 * Base interface for all CSV mappings
 */
interface BaseCsvMapping {
    mappingName: string;
    category: "data" | "lookup";
}

/**
 * Base interface for all destinations
 */
export interface BaseDestination {
    schemaRef: MySqlTable;
    columns: ColumnMap[];
    rowExpander?: RowExpanderFunction;
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
 * Function that transforms one CSV row into multiple DB rows
 */
type RowExpanderFunction = (csvRow: Record<string, any>) => Record<string, any>[];

export type CSVFileMapping = DataCsvMapping | LookupCsvMapping;

type DataDestinationOutput = {
    table: string;
    rows: Record<string, any>[];
};

export type MappedCSVData = DataDestinationOutput[];

type ForeignKeyReference = {
    columns: string[];
    foreignTable: string;
    foreignColumns: string[];
    onDelete: string;
    onUpdate: string;
};


// --- HELPER FUNCTIONS ---
import { convertDateMMDDYYYY } from "../utils/convert-dates";
import { parseTermCode } from "../utils/convert-term-code";
import { parseCourseCode } from "../utils/convert-course-code";

function getDrizzleSymbol(obj: any, symbolName: string): symbol | undefined {
    return Object.getOwnPropertySymbols(obj)
        .find(sym => sym.toString() === `Symbol(${symbolName})`);
}

/**
 * Get the composite or primary key of a MySQL table.
 * @param table The MySQL table to inspect.
 * @returns An array of column names that make up the composite primary key.
 */
export function getCompositePrimaryKey(table: MySqlTable): string[] {
    const extraConfigSymbol = getDrizzleSymbol(table, 'drizzle:ExtraConfigBuilder');
    if (!extraConfigSymbol) return [];

    const configBuilder = (table as any)[extraConfigSymbol];

    // If no composite key found, get simple primary key
    if (typeof configBuilder !== 'function') {
        const columnsSymbol = getDrizzleSymbol(table, 'drizzle:Columns');
        if (!columnsSymbol) return [];

        const columns = (table as any)[columnsSymbol];
        const primaryKeyColumns = Object.values(columns).filter((col: any) => col.primary);
        return primaryKeyColumns.map((col: any) => col.name);
    }

    const configs = configBuilder(table);

    const pkConfig = configs.find((cfg: any) =>
        typeof cfg === 'object' &&
        cfg?.constructor?.name === 'PrimaryKeyBuilder'
    );

    if (!pkConfig || !Array.isArray(pkConfig.columns)) return [];

    return pkConfig.columns.map((col: any) => col.name);
}

export function getDrizzleTableName(table: MySqlTable): string | undefined {
    for (const key of Object.getOwnPropertySymbols(table)) {
        if (key.toString() === 'Symbol(drizzle:Name)') {
            return (table as any)[key];
        }
    }
    return undefined;
}

export function getTableMetadata(table: MySqlTable) {
    const columnsSymbol = getDrizzleSymbol(table, 'drizzle:Columns');

    if (!columnsSymbol) throw new Error('Could not find columns symbol on table');

    const columns = (table as any)[columnsSymbol];

    const columnMetadata = Object.entries(columns).map(([_, col]) => {
        const typedCol = col as {
            name: string;
            columnType: string;
            notNull: boolean;
            length?: number;
            primary?: boolean;
            isUnique?: boolean;
        };
        return {
            name: typedCol.name,
            type: typedCol.columnType,
            notNull: typedCol.notNull,
            length: typedCol.length,
            isPrimaryKey: typedCol.primary === true,
            isUnique: typedCol.isUnique === true,
        };
    });

    return columnMetadata
}

export function getTableForeignKeys(table: MySqlTable): ForeignKeyReference[] {
    const fkSymbol = getDrizzleSymbol(table, 'drizzle:MySqlInlineForeignKeys');
    if (!fkSymbol) return [];

    const fks = (table as any)[fkSymbol];

    return fks.map((fk: any) => {
        const { columns, foreignTable, foreignColumns } = fk.reference();
        const nameSymbol = getDrizzleSymbol(foreignTable, 'drizzle:Name');
        const foreignTableName = nameSymbol ? foreignTable[nameSymbol] : undefined;

        return {
            columns: columns.map((c: any) => c.name) as string[],
            foreignTable: foreignTableName as string,
            foreignColumns: foreignColumns.map((c: any) => c.name) as string[],
            onDelete: fk.onDelete as string,
            onUpdate: fk.onUpdate as string,
        };
    });
}

// --- ROW EXPANDER FUNCTIONS ---
// Function that expands a single demographic row into multiple address rows
const expandStudentAddresses: RowExpanderFunction = (row) => {
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
            nation: row.homenation || 'USA',
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
                nation: row.locnation || 'USA',
                phone: row.locphone || ''
            });
        }
    }

    return results;
};

// Function that expands a single demographic row into multiple student program rows
const expandStudentPrograms: RowExpanderFunction = (row) => {
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
            levl: level,
            program: row.major1,
        });
    }

    // Add Major 2 if present
    if (row.major2) {
        results.push({
            mnumber: row.mnumber,
            term: term,
            year: year,
            type: 'MAJOR',
            levl: level,
            program: row.major2,
        });
    }

    // Add Minor 1 if present
    if (row.minor1) {
        results.push({
            mnumber: row.mnumber,
            term: term,
            year: year,
            type: 'MINOR',
            levl: level,
            program: row.minor1,
        });
    }

    // Add Minor 2 if present
    if (row.minor2) {
        results.push({
            mnumber: row.mnumber,
            term: term,
            year: year,
            type: 'MINOR',
            levl: level,
            program: row.minor2,
        });
    }

    return results;
};

// // Function that expands a single course row into multiple course rows
export function expandCourses(row: Record<string, string>) {
    const prefixMap = getPrefixMap();
    const out: Record<string, any>[] = [];

    const raw = row.course?.trim() || '';
    const m = /^([A-Za-z]+)(\d+)(.*)$/.exec(raw);
    if (!m) return out;

    const [, prefix] = m;
    const subject = prefix;

    // look up department/college, fallback if missing
    const { dept, coll } = prefixMap.get(subject) || {};

    if (!dept || !coll) {
        // If not found in prefixMap, assume it is a new prefix
        updatePrefixMap(subject, '0000', '0').catch(err => {
            console.error(`Error updating prefix map for ${subject}:`, err);
        });
    }

    // Return the same row with the dept and coll added
    out.push({
        ...row,
        department: dept || '0000',
        college: coll || '0'
    });

    return out;
};

export const csvFileMappings: CSVFileMapping[] = [
    {
        mappingName: "demographics",
        filePatterns: [
            /reg_cuba_demographic_\d+_\d+\.csv$/i,
            /\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i
        ],
        category: "data",
        destinations: [
            {
                schemaRef: schema.students,
                columns: [
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
                schemaRef: schema.studentAddresses,
                columns: [
                    { csvColumn: "mnumber", dbColumn: "mnumber" },
                    { csvColumn: "type", dbColumn: "type" },
                    { csvColumn: "street1", dbColumn: "street1" },
                    { csvColumn: "street2", dbColumn: "street2" },
                    { csvColumn: "city", dbColumn: "city" },
                    { csvColumn: "state", dbColumn: "state" },
                    { csvColumn: "zip", dbColumn: "zip" },
                    { csvColumn: "nation", dbColumn: "nation" },
                    { csvColumn: "phone", dbColumn: "phone" },
                ],
                // Use the row expander to create separate records for home and local addresses
                rowExpander: expandStudentAddresses
            },
            {
                schemaRef: schema.studentPrograms,
                columns: [
                    { csvColumn: "mnumber", dbColumn: "mnumber" },
                    { csvColumn: "term", dbColumn: "term", transform: (value) => parseTermCode(value).term },
                    { csvColumn: "term", dbColumn: "year", transform: (value) => parseTermCode(value).year },
                    { csvColumn: "type", dbColumn: "type" },
                    { csvColumn: "levl", dbColumn: "level" },
                    { csvColumn: "program", dbColumn: "program" },
                ],
                rowExpander: expandStudentPrograms
            },
            {
                schemaRef: schema.studentAdvisors,
                columns: [
                    { csvColumn: "mnumber", dbColumn: "student_mnumber" },
                    { csvColumn: "term", dbColumn: "term", transform: (value) => parseTermCode(value).term },
                    { csvColumn: "term", dbColumn: "year", transform: (value) => parseTermCode(value).year },
                    { csvColumn: "advnumb", dbColumn: "advisor_mnumber" },
                ]
            }
        ]
    },
    {
        mappingName: "student-instructor-courses",
        filePatterns: [
            /reg_cuba_courses_during_term_\d+_\d+\.csv$/i,
            /\d+_REG_CUBA_Courses_Grade_Time_Extract_\d+\.csv$/i
        ],
        category: "data",
        destinations: [
            {
                schemaRef: schema.studentCourses,
                columns: [
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
                schemaRef: schema.instructorCourses,
                columns: [
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
                schemaRef: schema.faculty,
                columns: [
                    { csvColumn: "instmnumber", dbColumn: "mnumber" },
                    { csvColumn: "instfirstnm", dbColumn: "first_name" },
                    { csvColumn: "instlastnm", dbColumn: "last_name" }
                ]
            }
        ]
    },

    // Lookup tables
    {
        mappingName: "courses-catalog",
        filePatterns: [/reg_cuba_catalog_\d+_\d+\.csv$/i],
        category: "lookup",
        destination: {
            schemaRef: schema.courses,
            columns: [
                { csvColumn: "course", dbColumn: "subject", transform: (value) => parseCourseCode(value).subject },
                { csvColumn: "course", dbColumn: "number", transform: (value) => parseCourseCode(value).number },
                { csvColumn: "course", dbColumn: "suffix", transform: (value) => parseCourseCode(value).suffix },
                { csvColumn: "crsetitle", dbColumn: "title" },
                { csvColumn: "crhrs", dbColumn: "hours", transform: (value) => Number(value) },
                { csvColumn: "course_fee", dbColumn: "fee", transform: (value) => value === 'NULL' ? 0 : Number(value) },
                { csvColumn: "web_fee", dbColumn: "web_fee", transform: (value) => value === 'NULL' ? 0 : Number(value) },
                {
                    csvColumn: "lastchanged", dbColumn: "last_updated",
                    transform: (value) => value === 'NULL'
                        ? format(new Date(), 'yyyy-MM-dd HH:mm:ss')
                        : format(new Date(value), 'yyyy-MM-dd HH:mm:ss')
                },
                { csvColumn: "department", dbColumn: "department" },
                { csvColumn: "college", dbColumn: "college" },
            ],
            rowExpander: expandCourses
        }
    },
    {
        mappingName: "academic-standing",
        category: "lookup",
        destination: {
            schemaRef: schema.academicStanding,
            columns: [
                { csvColumn: "code", dbColumn: "code" },
                { csvColumn: "description", dbColumn: "description" }
            ]
        }
    },
    {
        mappingName: "admit-codes",
        category: "lookup",
        destination: {
            schemaRef: schema.admitCodes,
            columns: [
                { csvColumn: "code", dbColumn: "code" },
                { csvColumn: "description", dbColumn: "description" }
            ]
        }
    },
    {
        mappingName: "colleges",
        category: "lookup",
        destination: {
            schemaRef: schema.colleges,
            columns: [
                { csvColumn: "code", dbColumn: "code" },
                { csvColumn: "description", dbColumn: "description" }
            ]
        }

    },
    {
        mappingName: "departments",
        category: "lookup",
        destination: {
            schemaRef: schema.departments,
            columns: [
                { csvColumn: "code", dbColumn: "code" },
                { csvColumn: "description", dbColumn: "description" },
                { csvColumn: "college", dbColumn: "college", transform: (value) => value === 'NULL' ? '0' : value }
            ],
        }
    },
    {
        mappingName: "instructional-methods",
        category: "lookup",
        destination: {
            schemaRef: schema.instructionalMethods,
            columns: [
                { csvColumn: "code", dbColumn: "code" },
                { csvColumn: "description", dbColumn: "description" }
            ]
        }
    },
    {
        mappingName: "nations",
        category: "lookup",
        destination: {
            schemaRef: schema.nations,
            columns: [
                { csvColumn: "code", dbColumn: "code" },
                { csvColumn: "description", dbColumn: "description" }
            ]
        }
    },
    {
        mappingName: "part-of-term",
        category: "lookup",
        destination: {
            schemaRef: schema.partOfTerm,
            columns: [
                { csvColumn: "code", dbColumn: "code" },
                { csvColumn: "description", dbColumn: "description" }
            ]
        }
    },
    {
        mappingName: "programs",
        category: "lookup",
        destination: {
            schemaRef: schema.programs,
            columns: [
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
                {
                    csvColumn: "added_on", dbColumn: "added_on", transform: (value) =>
                        value === 'NULL'
                            ? format(new Date(), 'yyyy-MM-dd HH:mm:ss')
                            : format(new Date(value), 'yyyy-MM-dd HH:mm:ss')
                }
            ]
        }
    },
    {
        mappingName: "registration-status",
        category: "lookup",
        destination: {
            schemaRef: schema.registrationStatus,
            columns: [
                { csvColumn: "code", dbColumn: "code" },
                { csvColumn: "description", dbColumn: "description" }
            ]
        }
    },
    {
        mappingName: "terms",
        category: "lookup",
        destination: {
            schemaRef: schema.terms,
            columns: [
                { csvColumn: "code", dbColumn: "code" },
                { csvColumn: "description", dbColumn: "description" }
            ]
        }
    },
    {
        mappingName: "course-prefixes",
        category: "lookup",
        destination: {
            schemaRef: schema.coursePrefixes,
            columns: [
                { csvColumn: "prefix", dbColumn: "prefix" },
                { csvColumn: "crsedept", dbColumn: "department" },
                { csvColumn: "crsecoll", dbColumn: "college" },
            ]
        }
    }
]

/**
 * Get mapping by name
 * @param mappingName The name of the mapping to retrieve
 * @returns The CSVFileMapping object or undefined if not found
 */
export function getMappingByName(mappingName: string): CSVFileMapping | undefined {
    return csvFileMappings.find(mapping => mapping.mappingName === mappingName);
}

export function getMappingByFilePattern(fileName: string): CSVFileMapping | undefined {
    return csvFileMappings.find(mapping =>
        mapping.filePatterns?.some(pattern => pattern.test(fileName))
    );
}

/**
 * Process multiple CSV rows for a specific destination table
 */
export const mapCSVData = (
    rows: Record<string, any>[],
    destinations: BaseDestination[] | BaseDestination
): MappedCSVData => {
    const dataDestinations: MappedCSVData = [];

    // Normalize to array
    const destArray = Array.isArray(destinations) ? destinations : [destinations];

    for (const row of rows) {
        for (const destination of destArray) {
            const expandedRows = destination.rowExpander ? destination.rowExpander(row) : [row]; // RowExpanderFunction

            const existing = dataDestinations.find(d => d.table === getDrizzleTableName(destination.schemaRef));

            const mappedRows = expandedRows.map(expandedRow => {
                const mapped: Record<string, any> = {};
                for (const column of destination.columns) {
                    const rawValue = expandedRow[column.csvColumn];
                    mapped[column.dbColumn] = column.transform
                        ? column.transform(rawValue)
                        : rawValue;
                }
                return mapped;
            });

            if (existing) {
                existing.rows.push(...mappedRows);
            } else {
                dataDestinations.push({
                    table: getDrizzleTableName(destination.schemaRef) || '',
                    rows: mappedRows
                });
            }
        }
    }

    return dataDestinations;
};

export const schemaRefToMetadata = (schemaRef: MySqlTable) => {
    return {
        name: getDrizzleTableName(schemaRef),
        columns: getTableMetadata(schemaRef),
        primaryKey: getCompositePrimaryKey(schemaRef),
        foreignKeys: getTableForeignKeys(schemaRef)
    };
}

export const getAllLookupMappingNames = (): string[] => {
    return csvFileMappings
        .filter(mapping => mapping.category === "lookup")
        .map(mapping => mapping.mappingName);
}