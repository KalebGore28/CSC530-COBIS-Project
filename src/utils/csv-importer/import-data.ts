import type { MySql2Database } from "drizzle-orm/mysql2";
import type { MySqlTable } from "drizzle-orm/mysql-core";
import type { ParseResult } from "papaparse";
import { getColumns, sql, type SQL } from "drizzle-orm";

import { CompositeCache } from "./composite-cache";

import type { makeMySqlCSVConfig } from "./make-csv-config";
import { findMySqlMatchingTables } from "./find-matching-tables";
import { findMissingColumns } from "./find-missing-columns";
import { describeDatabaseError } from "./describe-database-error";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildConflictUpdateColumns = <T extends MySqlTable, Q extends keyof T["_"]["columns"]>(
  table: T,
  columns: Array<Q>,
) => {
  const cls = getColumns(table);
  return columns.reduce(
    (acc, column) => {
      acc[column] = sql`values(${cls[column]})`;
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

export type ImportProgress = {
  processed: number;
  totalRows: number;
  // Across every table the file updates, since processed counts rows again for each table
  percent: number;
  currentStep: string;
};

// What's worth keeping about an import, as opposed to progress updates that are only for watching it run
export type ImportLogEntry = {
  level: "info" | "error";
  message: string;
};

// Long lists of values are cut off in the log, since a huge export could otherwise list thousands
const MAX_LOGGED_VALUES = 50;

export const importMySqlData = async (
  db: MySql2Database<any>,
  csvData: ParseResult<Record<string, string>>,
  fileName: string,
  csvConfig: ReturnType<typeof makeMySqlCSVConfig>,
  batchSize?: number,
  progress?: (update: ImportProgress) => void,
  log?: (entry: ImportLogEntry) => void,
) => {
  const importBatchSize = batchSize ?? 100; // Default to every 100 rows
  const writeLog = (level: ImportLogEntry["level"], message: string) => log?.({ level, message });

  const updateProgress = async (update: Partial<ImportProgress>) => {
    if (progress) {
      progress({
        processed: update.processed ?? 0,
        totalRows: update.totalRows ?? 0,
        percent: update.percent ?? 0,
        currentStep: update.currentStep ?? "Processing...",
      });
      await sleep(5); // yield to event loop
    }
  };

  // Get tables matching the file name
  const matchingTables = findMySqlMatchingTables(fileName, csvConfig);

  if (!matchingTables) {
    throw new Error(`No matching tables found for file: ${fileName}`);
  }

  // Checked before anything is written, so a renamed or missing column doesn't fail partway with a database error
  const missingColumns = findMissingColumns(fileName, csvData.meta.fields ?? [], csvConfig);
  if (missingColumns.length > 0) {
    throw new Error(`Missing columns: ${missingColumns.join(", ")}`);
  }

  writeLog(
    "info",
    `Importing ${csvData.data.length.toLocaleString()} rows from ${fileName} into ${[...matchingTables.keys()].join(", ")}`,
  );

  // Each table is an equal share of the import, and tableFraction is how far into the current one it is
  const overallPercent = (finishedTables: number, tableFraction: number) =>
    Math.floor(((finishedTables + tableFraction) / matchingTables.size) * 100);

  await updateProgress({
    processed: 0,
    totalRows: csvData.data.length,
    percent: 0,
    currentStep: `Starting import for file: ${fileName}`,
  });

  let tableIndex = 0;
  let totalProcessed = 0;

  for (const [tableName, tableConfig] of matchingTables) {
    tableIndex++;
    const tableStartedAt = Date.now();
    const cacheData = new CompositeCache();
    const processedTableData: Array<Record<string, any>> = [];

    await updateProgress({
      processed: totalProcessed,
      totalRows: csvData.data.length,
      percent: overallPercent(tableIndex - 1, 0),
      currentStep: `Processing table ${tableName} (${tableIndex}/${matchingTables.size})`,
    });

    // Preload cache for foreign key tables
    for (const fk of tableConfig.foreignKeys) {
      // If already cached, skip
      if (cacheData.has(fk.foreignTableName)) continue;

      // If there is no resolver, its pointless to cache as we can't resolve missing rows
      if (!fk.resolver) continue;

      const table = csvConfig.schema[fk.foreignTableName];

      // Build select object with actual column references
      const selectedColumns = fk.foreignColumns.reduce(
        (acc, col) => {
          acc[col] = (table as Record<string, any>)[col]; // Use actual column reference from schema
          return acc;
        },
        {} as Record<string, any>,
      );

      await db
        .select(selectedColumns)
        .from(table)
        .then((rows) => {
          for (const row of rows) {
            // Cache the row data. We don't need the keys
            const values = fk.foreignColumns.map((col) => row[col]);
            cacheData.add(fk.foreignTableName, ...values);
          }
        });
    }

    // Process each matching table
    if (tableConfig.config) {
      // Remap csv data to db columns
      const mappedRows = await Promise.all(
        csvData.data.map(async (row, _rowIndex) => {
          const mapped: Record<string, any> = {};

          for (const [dbColumn, mappingInfo] of Object.entries(tableConfig.config)) {
            const value = row[mappingInfo.csvColumnName];
            const transformedValue = mappingInfo.transform
              ? await mappingInfo.transform(value)
              : value;

            mapped[dbColumn] = transformedValue;
          }

          return mapped;
        }),
      );

      processedTableData.push(...mappedRows);
    } else {
      // Remap csv data to db columns
      const mappedRows =
        // rowExpander may or may not be async, so each result is wrapped to wait on them the same way
        (
          await Promise.all(
            csvData.data.map((row) => Promise.resolve(tableConfig.rowExpander(row))),
          )
        ).flat();

      processedTableData.push(...mappedRows);
    }

    // Resolve any foreign key issues
    for (const fk of tableConfig.foreignKeys) {
      // If there is no resolver, we can't resolve those rows
      if (!fk.resolver) continue;

      // Track missing rows for this foreign table, and their keys for the log
      const missingRows: Array<Record<string, any>> = [];
      const missingKeys: Array<string> = [];

      for (const row of processedTableData) {
        const cacheValues: any[] = [];

        for (const [tableCol, _foreignCol] of Object.entries(fk.columnMap)) {
          const value = row[tableCol];
          cacheValues.push(value);
        }

        // A blank reference doesn't point at anything, so there's nothing to add
        if (cacheValues.some((value) => value === undefined || value === null || value === "")) {
          continue;
        }

        // Check if this combination exists in the cache
        if (cacheData.has(fk.foreignTableName, ...cacheValues)) continue;

        // Cached now, so a value many rows share is only added once
        cacheData.add(fk.foreignTableName, ...cacheValues);

        // Remap keys to foreign table columns
        const foreignKeyRow = Object.fromEntries(
          Object.entries(fk.columnMap).map(([tableCol, foreignCol]) => [foreignCol, row[tableCol]]),
        );

        missingRows.push(await fk.resolver(foreignKeyRow));
        missingKeys.push(cacheValues.join("/"));
      }

      // Insert the missing values if found
      if (missingRows.length > 0) {
        try {
          await db.insert(csvConfig.schema[fk.foreignTableName]).values(missingRows);
        } catch (error) {
          const { reason } = describeDatabaseError(error);
          throw new Error(
            `${tableName}: couldn't add placeholder ${fk.foreignTableName} rows: ${reason}`,
            { cause: error },
          );
        }

        const shownKeys = missingKeys.slice(0, MAX_LOGGED_VALUES).join(", ");
        const moreKeys =
          missingKeys.length > MAX_LOGGED_VALUES
            ? ` and ${missingKeys.length - MAX_LOGGED_VALUES} more`
            : "";
        writeLog(
          "info",
          `${tableName}: added ${missingKeys.length} placeholder rows to ${fk.foreignTableName} for values COBIS didn't have yet: ${shownKeys}${moreKeys}`,
        );
      }
    }

    const table = csvConfig.schema[tableName];
    const nonPrimaryColumns = Object.entries(table)
      .filter(([, column]) => !column.primary)
      .map(([columnName]) => columnName);

    await db.transaction(async (tx) => {
      for (let i = 0; i < processedTableData.length; i += importBatchSize) {
        const batch = processedTableData.slice(i, i + importBatchSize);

        await updateProgress({
          processed: totalProcessed + i,
          totalRows: csvData.data.length,
          percent: overallPercent(tableIndex - 1, i / processedTableData.length),
          currentStep: `Inserting batch ${Math.floor(i / importBatchSize) + 1} for ${tableName}`,
        });

        try {
          await tx
            .insert(table)
            .values(batch)
            .onDuplicateKeyUpdate({
              set: buildConflictUpdateColumns(table, nonPrimaryColumns),
            });
        } catch (error) {
          const { reason, rowInBatch } = describeDatabaseError(error);
          const failedRow = rowInBatch !== undefined ? batch[rowInBatch - 1] : undefined;

          // Mapped tables write one row per CSV row, so the failed row points back to a line in the file (line 1 is the header).
          // Expanded rows don't line up with the file, so those only get the range being written.
          const where =
            tableConfig.config && rowInBatch !== undefined
              ? `CSV line ${(i + rowInBatch + 1).toLocaleString()}`
              : `while writing rows ${(i + 1).toLocaleString()}–${(i + batch.length).toLocaleString()}`;

          if (failedRow) {
            writeLog("error", `${tableName}: the row that failed had ${JSON.stringify(failedRow)}`);
          }
          throw new Error(`${tableName}, ${where}: ${reason}`, { cause: error });
        }
      }
    });

    totalProcessed += processedTableData.length;

    const seconds = ((Date.now() - tableStartedAt) / 1000).toFixed(1);
    const fromRows =
      processedTableData.length === csvData.data.length
        ? ""
        : ` (from ${csvData.data.length.toLocaleString()} CSV rows)`;
    writeLog(
      "info",
      `${tableName}: wrote ${processedTableData.length.toLocaleString()} rows${fromRows} in ${seconds}s`,
    );

    await updateProgress({
      processed: totalProcessed,
      totalRows: csvData.data.length,
      percent: overallPercent(tableIndex, 0),
      currentStep: `Completed table ${tableName}`,
    });
  }

  await updateProgress({
    processed: csvData.data.length,
    totalRows: csvData.data.length,
    percent: 100,
    currentStep: "Import complete",
  });
};
