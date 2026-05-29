import type { MySql2Database } from 'drizzle-orm/mysql2'
import type { MySqlTable } from 'drizzle-orm/mysql-core'
import type { ParseResult } from 'papaparse'
import { getColumns, sql, type SQL } from 'drizzle-orm'

import { CompositeCache } from './composite-cache'

import type { makeMySqlCSVConfig } from './make-csv-config'
import { findMySqlMatchingTables } from './find-matching-tables'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const buildConflictUpdateColumns = <
    T extends MySqlTable,
    Q extends keyof T['_']['columns'],
>(
    table: T,
    columns: Array<Q>,
) => {
    const cls = getColumns(table)
    return columns.reduce(
        (acc, column) => {
            acc[column] = sql`values(${cls[column]})`
            return acc
        },
        {} as Record<Q, SQL>,
    )
}

export type ImportProgress = {
    processed: number
    totalRows: number
    currentStep: string
}

export const importMySqlData = async (
    db: MySql2Database<any>,
    csvData: ParseResult<Record<string, string>>,
    fileName: string,
    csvConfig: ReturnType<typeof makeMySqlCSVConfig>,
    batchSize?: number,
    progress?: (update: ImportProgress) => void,
) => {
    const importBatchSize = batchSize ?? 100 // Default to every 100 rows

    const updateProgress = async (update: Partial<ImportProgress>) => {
        if (progress) {
            progress({
                processed: update.processed ?? 0,
                totalRows: update.totalRows ?? 0,
                currentStep: update.currentStep ?? 'Processing...',
            })
            await sleep(5) // yield to event loop
        }
    }

    // Get tables matching the file name
    const matchingTables = findMySqlMatchingTables(fileName, csvConfig)

    if (!matchingTables) {
        throw new Error(`No matching tables found for file: ${fileName}`)
    }

    await updateProgress({
        processed: 0,
        totalRows: csvData.data.length,
        currentStep: `Starting import for file: ${fileName}`,
    })

    let tableIndex = 0
    let totalProcessed = 0

    for (const [tableName, tableConfig] of matchingTables) {
        tableIndex++
        const cacheData = new CompositeCache()
        const processedTableData: Array<Record<string, any>> = []

        await updateProgress({
            processed: totalProcessed,
            totalRows: csvData.data.length,
            currentStep: `Processing table ${tableName} (${tableIndex}/${matchingTables.size})`,
        })

        // Preload cache for foreign key tables
        for (const fk of tableConfig.foreignKeys) {
            // If already cached, skip
            if (cacheData.has(fk.foreignTableName)) continue

            // If there is no resolver, its pointless to cache as we can't resolve missing rows
            if (!fk.resolver) continue

            const table = csvConfig.schema[fk.foreignTableName]

            // Build select object with actual column references
            const selectedColumns = fk.foreignColumns.reduce(
                (acc, col) => {
                    acc[col] = (table as Record<string, any>)[col] // Use actual column reference from schema
                    return acc
                },
                {} as Record<string, any>,
            )

            await db
                .select(selectedColumns)
                .from(table)
                .then((rows) => {
                    for (const row of rows) {
                        // Cache the row data. We don't need the keys
                        const values = fk.foreignColumns.map((col) => row[col])
                        cacheData.add(fk.foreignTableName, ...values)
                    }
                })
        }

        // Process each matching table
        if (tableConfig.config) {
            // Remap csv data to db columns
            const mappedRows = await Promise.all(
                csvData.data.map(async (row, _rowIndex) => {
                    const mapped: Record<string, any> = {}

                    for (const [dbColumn, mappingInfo] of Object.entries(
                        tableConfig.config,
                    )) {
                        const value = row[mappingInfo.csvColumnName]
                        const transformedValue = mappingInfo.transform
                            ? await mappingInfo.transform(value)
                            : value

                        mapped[dbColumn] = transformedValue
                    }

                    return mapped
                }),
            )

            processedTableData.push(...mappedRows)
        } else {
            // Remap csv data to db columns
            const mappedRows = (
                await Promise.all(
                    csvData.data.map((row) => tableConfig.rowExpander(row)),
                )
            ).flat()

            processedTableData.push(...mappedRows)
        }

        // Resolve any foreign key issues
        for (const fk of tableConfig.foreignKeys) {
            // If there is no resolver, we can't resolve those rows
            if (!fk.resolver) continue

            // Track missing rows for this foreign table
            const missingRows: Array<Record<string, any>> = []

            for (const row of processedTableData) {
                const cacheValues: any[] = []

                for (const [tableCol, _foreignCol] of Object.entries(
                    fk.columnMap,
                )) {
                    const value = row[tableCol]
                    cacheValues.push(value)
                }

                // Check if this combination exists in the cache
                const exists = cacheData.has(
                    fk.foreignTableName,
                    ...cacheValues,
                )

                if (exists === undefined) {
                    // Remap keys to foreign table columns
                    const foreignKeyRow = Object.fromEntries(
                        Object.entries(fk.columnMap).map(
                            ([tableCol, foreignCol]) => [
                                foreignCol,
                                row[tableCol],
                            ],
                        ),
                    )

                    missingRows.push(fk.resolver(foreignKeyRow))
                }
            }

            // Insert the missing values if found
            if (missingRows.length > 0) {
                await db
                    .insert(csvConfig.schema[fk.foreignTableName])
                    .values(missingRows)
            }
        }

        const table = csvConfig.schema[tableName]
        const nonPrimaryColumns = Object.entries(table)
            .filter(([, column]) => !column.primary)
            .map(([columnName]) => columnName)

        await db.transaction(async (tx) => {
            for (
                let i = 0;
                i < processedTableData.length;
                i += importBatchSize
            ) {
                const batch = processedTableData.slice(i, i + importBatchSize)

                await updateProgress({
                    processed: totalProcessed + i,
                    totalRows: csvData.data.length,
                    currentStep: `Inserting batch ${Math.floor(i / importBatchSize) + 1} for ${tableName}`,
                })

                await tx
                    .insert(table)
                    .values(batch)
                    .onDuplicateKeyUpdate({
                        set: buildConflictUpdateColumns(
                            table,
                            nonPrimaryColumns,
                        ),
                    })
            }
        })

        totalProcessed += processedTableData.length

        await updateProgress({
            processed: totalProcessed,
            totalRows: csvData.data.length,
            currentStep: `Completed table ${tableName}`,
        })
    }

    await updateProgress({
        processed: csvData.data.length,
        totalRows: csvData.data.length,
        currentStep: 'Import complete',
    })
}
