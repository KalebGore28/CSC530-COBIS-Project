import type {
    MySqlTable,
    ForeignKey,
    MySqlColumn,
} from 'drizzle-orm/mysql-core'

import type {
    PrimaryKeyType,
    TableInsertType,
    TableConfig,
    MaybePromise,
    ColumnMapping,
} from './mapping-types'

type ForeignKeyInfo = {
    columns: Array<string>
    foreignColumns: Array<string>
    foreignTableName: string
    columnMap: Record<string, string> // tableColumn -> foreignTableColumn
    resolver?: (
        missingData: PrimaryKeyType<any>,
    ) => MaybePromise<TableInsertType<any>>
}

// Extended table config that includes foreign keys
type TableConfigWithFKs<T> = {
    [K in keyof T]: T[K] & {
        foreignKeys: Array<ForeignKeyInfo>
    }
}

type InvertCSVConfig<T extends Record<string, ColumnMapping<any>>> = {
    [K in keyof T as T[K]['csvColumnName']]: {
        dbColumnName: K
        transform?: T[K]['transform']
    }
}

export type OptimizedLookup = {
    schema: Record<string, MySqlTable<any>>
    lookup: Map<
        string,
        {
            regex: RegExp
            tables: Map<
                string,
                | {
                      config: InvertCSVConfig<TableInsertType<any>>
                      missingRowResolver?: (
                          data: PrimaryKeyType<any>,
                      ) => MaybePromise<TableInsertType<any>>
                      foreignKeys: Array<ForeignKeyInfo>
                  }
                | {
                      rowExpander: (
                          row: Record<string, string>,
                      ) => MaybePromise<TableInsertType<any>[]>
                      foreignKeys: Array<ForeignKeyInfo>
                      config?: never
                  }
            >
        }
    >
}

function getDrizzleSymbolObject(
    table: MySqlTable<any>,
    symbolName: string,
): any {
    // Access the internal Drizzle symbol to get table metadata
    const drizzleSymbol = Object.getOwnPropertySymbols(table).find((sym) =>
        sym.toString().includes(symbolName),
    )
    return drizzleSymbol ? (table as any)[drizzleSymbol] : null
}

function getForeignKeys(
    table: MySqlTable<any>,
    tableConfig: TableConfig<any>,
): Array<ForeignKeyInfo> {
    const foreignKeys = getDrizzleSymbolObject(
        table,
        'InlineForeignKeys',
    ) as Array<ForeignKey>
    const extraConfigBuilder = getDrizzleSymbolObject(
        table,
        'ExtraConfigBuilder',
    ) as Function

    // If extraConfigBuilder exists, call it to get extra foreign keys
    if (extraConfigBuilder) {
        const configs = extraConfigBuilder(table)
            // Filter to only foreign key configs that have: ForeignKeyBuilder
            .filter((cfg: any) => cfg.constructor.name === 'ForeignKeyBuilder')
        foreignKeys.push(...configs)
    }

    return foreignKeys.map((fk) => {
        const { columns, foreignColumns, foreignTable } = fk.reference()

        const foreignTableName = getDrizzleSymbolObject(
            foreignTable,
            'Name',
        ) as string

        // Helper to map DB column names to JS column names. (e.g. user_id to userId)
        // When inserting data, drizzle expects JS column names that was configured in schema.
        const mapToJsNames = (table: MySqlTable, cols: MySqlColumn[]) =>
            cols.map((col) => {
                const jsName = Object.entries(table).find(
                    ([_jsKey, tableCol]) => tableCol.name === col.name,
                )?.[0]
                if (!jsName)
                    throw new Error(
                        `No JS column found for DB column: ${col.name}`,
                    )
                return jsName
            })

        const jsColumns = mapToJsNames(table, columns)
        const jsForeignColumns = mapToJsNames(foreignTable, foreignColumns)

        // Build the column map: tableColumn -> foreignTableColumn
        const columnMap: Record<string, string> = {}
        jsColumns.forEach((col, idx) => {
            columnMap[col] = jsForeignColumns[idx]
        })

        return {
            columns: jsColumns,
            foreignColumns: jsForeignColumns,
            foreignTableName,
            columnMap,
            resolver: tableConfig[foreignTableName]?.missingRowResolver,
        }
    })
}

function invertConfig<T extends Record<string, ColumnMapping<any>>>(
    config: T,
): InvertCSVConfig<T> {
    const inverted = {} as any

    for (const [dbColumn, value] of Object.entries(config)) {
        inverted[value.csvColumnName] = {
            dbColumnName: dbColumn,
            transform: value.transform,
        }
    }

    return inverted
}

function buildOptimizedLookup(
    input: TableConfigWithFKs<TableConfig<any>>,
    schema: Record<string, MySqlTable<any>>,
): OptimizedLookup {
    const optimizedLookup: OptimizedLookup = {
        schema,
        lookup: new Map(),
    }

    for (const [tableName, table] of Object.entries(input)) {
        for (const mapping of table.mappings) {
            if (!mapping.config) {
                // Skip transformations that use rowExpander. Instead just return the mapping as-is
                for (const regex of mapping.regex) {
                    const key = regex.source

                    if (!optimizedLookup.lookup.has(key)) {
                        optimizedLookup.lookup.set(key, {
                            regex,
                            tables: new Map(),
                        })
                    }

                    optimizedLookup.lookup.get(key)!.tables.set(tableName, {
                        rowExpander: mapping.rowExpander!,
                        foreignKeys: table.foreignKeys,
                    })
                }
                continue
            }
            for (const regex of mapping.regex) {
                const key = regex.source

                if (!optimizedLookup.lookup.has(key)) {
                    optimizedLookup.lookup.set(key, {
                        regex,
                        tables: new Map(),
                    })
                }

                optimizedLookup.lookup.get(key)!.tables.set(tableName, {
                    config: invertConfig(mapping.config),
                    missingRowResolver: table.missingRowResolver,
                    foreignKeys: table.foreignKeys,
                })
            }
        }
    }

    return optimizedLookup
}

export function makeMySqlCSVConfig<
    Tables extends Record<string, MySqlTable<any>>,
>(schema: Tables, config: TableConfig<Tables>) {
    const result = {} as TableConfigWithFKs<TableConfig<Tables>>

    // Iterate through each table in the config
    for (const tableName in config) {
        const tableKey = tableName as keyof TableConfig<Tables>
        const table = schema[tableKey]

        if (!table) {
            throw new Error(`Table "${tableName}" not found in schemas`)
        }

        const foreignKeys = getForeignKeys(table, config)

        // Create a new object that extends the table config with foreignKeys
        result[tableKey] = {
            ...config[tableKey], // Carry over existing config properties
            foreignKeys, // Add foreign keys info
        }
    }

    const optimizedLookup = buildOptimizedLookup(result, schema)

    return optimizedLookup
}
