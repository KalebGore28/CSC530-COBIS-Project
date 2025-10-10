import fs from 'fs';
import path from 'path';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { createCSVConfig } from './create-csv-config';
import { importData } from './import';
import Papa from 'papaparse';
import { Column } from 'drizzle-orm';

// Function to conform data based on column type and constraints
export const dataConformer = (
    value: string,
    column: Column,
    forceConform?: boolean
) => {
    // Catch common data type conversions
    if (value === null || value === undefined) {

        // Handle auto-increment columns
        if ((column as any).autoIncrement) {
            return undefined;
        }

        // Handle NOT NULL constraints
        if (column.notNull) {
            throw new Error(`Null or empty value for NOT NULL column: ${column.name}`);
        }
    }

    switch (column.dataType) {
        case "number":
            return parseInt(value, 10);
        case "string":
            return value;
        case "boolean":
            // Check if value is a valid boolean representation
            if (value === "1" || value === "0" || value.toLowerCase() === "true" || value.toLowerCase() === "false") {
                return value === "1" || value.toLowerCase() === "true";
            }
            break;
    }

    // Handle default values
    if (forceConform && column.hasDefault && column.default !== undefined) {
        return column.default;
    }
}

/**
 * Loops through all tables in configMapping and returns an array of
 * table names whose patterns match the given pattern_input.
 */
export const findMatchingTables = (
    pattern_input: string,
    configMapping: ReturnType<typeof createCSVConfig>
) => {
    const matchingTables: string[] = [];

    for (const [tableName, config] of Object.entries(configMapping.tables)) {
        const patterns = config.patterns;
        const isMatch = patterns.some(pattern =>
            pattern instanceof RegExp ? pattern.test(pattern_input) : new RegExp(pattern).test(pattern_input)
        );
        if (isMatch) {
            matchingTables.push(tableName);
        }
    }

    return matchingTables;
}

/**
 * Parses CSV content using PapaParse and returns a promise with the results.
 * @param fileContent - The CSV file content as a string
 * @returns A promise that resolves to the parsed CSV data
 */
export function parseCSV(fileContent: string): Promise<Papa.ParseResult<any>> {
    return new Promise((resolve, reject) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results),
            error: (e: any) => reject(e),
        });
    });
}

/**
 * Reads a CSV file, parses it, and imports the data.
 * @param db - Drizzle database instance
 * @param filePath - Full path to the CSV file
 * @param csvConfig - CSV configuration
 */
export async function importCSVFile(
    db: MySql2Database<any>,
    filePath: string,
    csvConfig: ReturnType<typeof createCSVConfig>
) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsedData = await parseCSV(fileContent);
    const fileName = path.basename(filePath);
    await importData(db, parsedData, fileName, csvConfig);
}