//import.ts
import type { createCSVConfig } from "./create-csv-config";
import type { ParseResult } from 'papaparse';
import { findMatchingTables } from "./utils";
import { MySql2Database } from "drizzle-orm/mysql2";
import { getTableColumns } from "drizzle-orm";
import { dataConformer } from "./utils";

export const importData = async (
    db: MySql2Database<any>,
    results: ParseResult<any>,
    pattern: string,
    configMapping: ReturnType<typeof createCSVConfig>
) => {
    // Get tables matching the filename
    const tableNames = findMatchingTables(pattern, configMapping);

    if (!tableNames?.length) {
        console.warn(`No matching tables found for pattern: ${pattern}`);
        return;
    }

    // // Create a map with table name as key and config as value
    const tableConfigMap = new Map<string, (typeof configMapping.tables)[string]>();

    // Populate the map
    for (const tableName of tableNames) {
        const config = configMapping.tables[tableName as keyof typeof configMapping.tables];
        if (config) {
            tableConfigMap.set(tableName, config);
        }
    }

    // Begin mapping data to tables from config
    const tableDataMap = new Map<string, Record<string, any>[]>();

    for (const [tableName, { config, rowExpander }] of tableConfigMap.entries()) {
        // Step 1: Apply rowExpander first (if present)
        const expandedData = rowExpander
            ? results.data.flatMap((row) => rowExpander(row)) // fan out
            : results.data;

        // Step 2: Perform normal mapping over expandedData
        const mappedRows = expandedData.map((row) => {
            const mapped: Record<string, any> = {};
            for (const [columnName, columnConfig] of Object.entries(config)) {
                const { csvColumnName, transform } = columnConfig as {
                    csvColumnName: string;
                    transform?: (value: any) => any;
                };
                const forcedConform =
                    "forcedConform" in columnConfig
                        ? (columnConfig as any).forcedConform
                        : undefined;

                let value = row[csvColumnName];
                if (transform) {
                    value = transform(value);
                }

                const table = configMapping.schema[tableName as keyof typeof configMapping.schema];
                if (!table) throw new Error(`Table ${tableName} not found in schema`);

                const columns = getTableColumns(table);
                const column = columns[columnName];
                if (!column) throw new Error(`Column ${columnName} not found in table ${tableName}`);

                try {
                    value = dataConformer(value, column, forcedConform);
                } catch (err) {
                    console.error(`Error conforming value for ${tableName}.${columnName}:`, err);
                    throw err;
                }

                mapped[columnName] = value;
            }
            return mapped;
        });

        tableDataMap.set(tableName, mappedRows);
    }


    // Begin inserting data into tables
    for (const [tableName, rows] of tableDataMap.entries()) {
        const table = configMapping.schema[tableName as keyof typeof configMapping.schema];

        if (!table) {
            console.warn(`Table ${tableName} not found in schema, skipping`);
            continue;
        }

        if (!rows.length) {
            console.warn(`No rows to import for table ${tableName}`);
            continue;
        }

        try {
            // Iterate over each row and perform an individual insert or update
            for (const row of rows) {
                await db
                    .insert(table)
                    .values(row) // Insert a single row
                    .onDuplicateKeyUpdate({ set: row }) // Update with values from that single row
                    .execute();
            }
            console.log(`✅ Imported ${rows.length} rows into ${tableName}`);
        } catch (err) {
            console.error(`❌ Failed to import ${tableName}:`, err);
        }
    }
}