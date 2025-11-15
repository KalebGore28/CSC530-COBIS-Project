import type { createCSVConfig } from "./create-csv-config";
import type { ParseResult } from "papaparse";
import { findMatchingTables } from "./find-matching-tables";
import { MySql2Database } from "drizzle-orm/mysql2";
import { getTableColumns } from "drizzle-orm";
import { dataConformer } from "./data-conformer";
import { CompositeCache } from "./composite-cache";

export const importData = async (
  db: MySql2Database<any>,
  results: ParseResult<Record<string, string>>,
  pattern: string,
  configMapping: ReturnType<typeof createCSVConfig>,
  progress?: { write: (msg: string) => void; end?: () => void }
) => {
  const emit = (type: string, data: any) =>
    progress?.write(JSON.stringify({ type, data }))

  // Get tables matching the filename
  const tableConfigMap = findMatchingTables(pattern, configMapping);
  if (!tableConfigMap.size) {
    throw new Error(`No matching tables found for pattern: ${pattern}`);
  }

  const cacheData = new CompositeCache();

  // Find foreign keys for each table
  for (const [tableName, _] of tableConfigMap.entries()) {

    const foreignKeys = configMapping.tables[tableName as keyof typeof configMapping.tables]?.meta.foreignKeys;
    if (!foreignKeys) {
      continue;
    }

    // Cache foreign key tables if missingRowResolver is provided
    for (const fk of foreignKeys) {
      // If already cached, skip
      if (cacheData.has(tableName)) continue;

      // Get the foreign table config and schema
      const foreignTableConfig = configMapping.tables[fk.foreignTableName as keyof typeof configMapping.tables];
      const foreignTableSchema = configMapping.schema[fk.foreignTableName as keyof typeof configMapping.schema];

      // If the foreign table does not have a missingRowResolver, skip
      if (!foreignTableConfig || !foreignTableConfig.missingRowResolver) continue;

      // Fetch existing data from the foreign table
      await db
        .select()
        .from(foreignTableSchema)
        .then(rows => {
          for (const row of rows) {
            // Only use the foreign key columns
            const keyParts = fk.foreignColumns.map(col => row[col]);

            // Add to cache (table name + key parts)
            cacheData.add(fk.foreignTableName, ...keyParts);
          }
        });
    }
  }

  // Begin mapping data to tables from config
  const tableDataMap = new Map<string, Record<string, any>[]>();

  for (const [tableName, { config, rowExpander }] of tableConfigMap.entries()) {

    if (config) {
      const table = configMapping.schema[tableName as keyof typeof configMapping.schema];
      if (!table) throw new Error(`Table ${tableName} not found in schema`);

      const columns = getTableColumns(table);

      const mappedRows = results.data.map((row) => {
        const mapped: Record<string, any> = {};

        for (const [columnName, columnConfig] of Object.entries(config as Record<string, { csvColumnName: string | string[]; transform?: (v: any) => any; combineCSVColumns?: boolean }>)) {
          const { csvColumnName, transform, combineCSVColumns } = columnConfig;
          // Normalize CSV column names to array
          const csvNames = Array.isArray(csvColumnName) ? csvColumnName : [csvColumnName];

          // Find first matching value

          let value = combineCSVColumns
            ? csvNames.map((name) => row[name] || '').join('')
            : csvNames.map((name) => row[name]).find((v) => v !== undefined);

          const column = columns[columnName];
          if (!column) throw new Error(`Column ${columnName} not found in table ${tableName}`);

          try {
            // If transform is provided, use it; otherwise, use dataConformer
            mapped[columnName] = transform ? transform(value) : dataConformer(value, column);
          } catch (err) {
            console.error(`Error conforming value for ${tableName}.${columnName}:`, err);
            emit('error', { message: `Error conforming value for ${tableName}.${columnName}: ${err}` });
            throw err;
          }
        }

        return mapped;
      });

      tableDataMap.set(tableName, mappedRows);
      continue;
    }

    if (rowExpander) {
      const expandedData = rowExpander
        ? results.data.flatMap((row) => rowExpander(row)) // fan out
        : results.data;

      tableDataMap.set(tableName, expandedData);
      continue;
    }
  }

  // Begin inserting data into tables
  let tableIterations = 0;
  for (const [tableName, rows] of tableDataMap.entries()) {
    tableIterations++;
    emit('progress', {
      message: `Processing table ${tableName} (${tableIterations}/${tableDataMap.size})`,
      table: tableName,
      currentTable: tableIterations,
      totalTables: tableDataMap.size,
      currentRow: 0,
      totalRows: rows.length,
    });

    const table = configMapping.schema[tableName as keyof typeof configMapping.schema];
    const foreignKeys = configMapping.tables[tableName as keyof typeof configMapping.tables]?.meta.foreignKeys;

    if (!table) {
      console.warn(`Table ${tableName} not found in schema, skipping`);
      continue;
    }

    if (!rows.length) {
      console.warn(`No rows to import for table ${tableName}`);
      continue;
    }

    let importedRows = 0;
    try {

      // Iterate over each row and perform an individual insert or update
      for (const row of rows) {

        for (const fk of foreignKeys || []) {

          // Get the foreign table config
          const foreignTableConfig = configMapping.tables[fk.foreignTableName as keyof typeof configMapping.tables];
          const foreignTableSchema = configMapping.schema[fk.foreignTableName as keyof typeof configMapping.schema];

          // If no resolver, skip
          if (!foreignTableConfig || !foreignTableConfig.missingRowResolver) {
            continue;
          }
          const keyParts = fk.columns.map(col => row[col] || ''); // Foreign Key can't be null so use '' for missing values

          const existsInCache = cacheData.has(fk.foreignTableName, ...keyParts);
          if (!existsInCache) {
            emit('warning', { message: `Missing foreign key for table ${fk.foreignTableName} with key '${keyParts.join('|')}'. Attempting to resolve...` });
            // Call the missing row resolver to get the missing data
            const missingData = foreignTableConfig.missingRowResolver(keyParts);
            if (missingData) {
              // Insert the missing data into the foreign table
              if (!foreignTableSchema) {
                throw new Error(`Foreign table ${fk.foreignTableName} not found in schema`);
              }

              await db
                .insert(foreignTableSchema)
                .values(missingData)
                .execute();

              emit('progress', { message: `Inserted missing foreign key '${keyParts.join('|')}' row into ${fk.foreignTableName}` });

              // Add to cache
              cacheData.add(fk.foreignTableName, ...keyParts);
            }
          }
        }

        try {
          await db
            .insert(table)
            .values(row)
            .onDuplicateKeyUpdate({ set: row })
            .execute();
          importedRows++;
          emit('progress', {
            message: `Imported ${importedRows}/${rows.length} rows into ${tableName}`,
            table: tableName,
            currentTable: tableIterations,
            totalTables: tableDataMap.size,
            currentRow: importedRows,
            totalRows: rows.length,
          });
        } catch (err) {
          emit('error', {
            message: `Failed to insert/update row in ${tableName}: ${err}`,
            error: String(err),
          });
          console.error(`❌ Failed to insert/update row in ${tableName}:`);
        }
      }

      console.log(`✅ Imported ${rows.length} rows into ${tableName}`);
    } catch (err) {
      console.error(`❌ Failed to import ${tableName}:`, err);
    }
  }
};