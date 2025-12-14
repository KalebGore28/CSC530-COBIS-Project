import { getTableColumns } from 'drizzle-orm'
import type { MySqlColumn, MySqlTable } from 'drizzle-orm/mysql-core'

type ForeignKeyInfo = {
    columns: Array<string>
    foreignColumns: Array<string>
    foreignTableName: string
    resolver?: (missingId: any) => any // function or undefined
}

function getDrizzleSymbol(
    table: MySqlTable<any>,
    symbolName: string,
): symbol | null {
    return (
        Object.getOwnPropertySymbols(table).find((sym) =>
            sym.toString().includes(symbolName),
        ) || null
    )
}

function getDrizzleColumnName<TTable extends MySqlTable<any>>(
    table: TTable,
    columnName: string,
): string | null {
    const columnsym = getDrizzleSymbol(table, 'Columns')
    if (!columnsym) return null

    const columnKeys = (table as any)[columnsym]
    const columnEntry = Object.entries(columnKeys).find(
        ([key, col]: [string, any]) => col.name === columnName,
    )

    if (columnEntry) {
        const [key, _] = columnEntry
        return key
    }

    return null
}

function getForeignKeys(table: MySqlTable<any>): Array<ForeignKeyInfo> {
    const fksym = getDrizzleSymbol(table, 'InlineForeignKeys')
    if (!fksym) return []

    const configBuilder = (table as any)[
        getDrizzleSymbol(table, 'ExtraConfigBuilder')!
    ]

    let fks: Array<any> = []

    // If configBuilder exists, call it to get extra foreign keys
    if (configBuilder) {
        const configs = configBuilder(table)
            // Filter to only foreign key configs that have: ForeignKeyBuilder
            .filter((cfg: any) => cfg.constructor.name === 'ForeignKeyBuilder')
        fks = configs
    }

    // Add (table as any)[fksym] to fks
    fks = fks.concat((table as any)[fksym] || [])
    return fks.map((fk) => {
        const { columns, foreignColumns, foreignTable } = fk.reference()

        const drizzleColumnNames = columns.map((col: any) => {
            const colName = getDrizzleColumnName(table, col.name)
            if (!colName) {
                throw new Error(`Column ${col.name} not found in table`)
            }
            return colName
        })

        const foreignColumnNames = foreignColumns.map((col: any) => {
            const colName = getDrizzleColumnName(foreignTable, col.name)
            if (!colName) {
                throw new Error(
                    `Foreign column ${col.name} not found in referenced table`,
                )
            }
            return colName
        })

        const foreignTableNameSym = getDrizzleSymbol(foreignTable, 'Name')
        const foreignTableName = foreignTableNameSym
            ? foreignTable[foreignTableNameSym]
            : ''

        return {
            columns: drizzleColumnNames,
            foreignColumns: foreignColumnNames,
            foreignTableName: foreignTableName,
        }
    })
}

type HasDefaultOrNullable<D, N> = D extends true
    ? true
    : N extends false
      ? true
      : false

type ColumnHasDefault<C> = C extends {
    config: { hasDefault: infer D; notNull: infer N }
}
    ? HasDefaultOrNullable<D, N>
    : C extends MySqlColumn<infer Col, any, any>
      ? HasDefaultOrNullable<Col['hasDefault'], Col['notNull']>
      : false

// --- Column config props ---
type ColumnConfig = {
    csvColumnName: string | Array<string>
    transform?: (value: any) => any
    combineCSVColumns?: boolean
}

// --- Map table columns to configuration objects ---
type TableConfig<T extends Record<string, any>> = {
    [K in keyof T as ColumnHasDefault<T[K]> extends true
        ? K
        : never]?: ColumnConfig
} & {
    [K in keyof T as ColumnHasDefault<T[K]> extends false
        ? K
        : never]: ColumnConfig
}

// --- Generic function that infers the config type ---
function createTableConfig<TTable extends MySqlTable<any>>(table: TTable) {
    const columns = getTableColumns(table)

    type Config = TableConfig<typeof columns>
    return {} as Config
}

// --- Row type: required vs optional based on defaults/nullability ---
type TableRowFromColumns<
    TColumns extends Record<string, MySqlColumn<any, any, any>>,
> = {
    // optional if has default or nullable
    [K in keyof TColumns as ColumnHasDefault<TColumns[K]> extends true
        ? K
        : never]?: any
} & {
    // required if no default and not nullable
    [K in keyof TColumns as ColumnHasDefault<TColumns[K]> extends false
        ? K
        : never]: any
}

// --- Unified CSV config type for a table ---
type TableCSVConfig<TTable extends MySqlTable<any>> =
    | {
          patterns: Array<RegExp>
          config: ReturnType<typeof createTableConfig<TTable>>
          rowExpander?: never
          missingRowResolver?: (
              missingData: Array<any>,
          ) => TableRowFromColumns<ReturnType<typeof getTableColumns<TTable>>>
          meta: Readonly<{
              tableName: string
              foreignKeys: ReturnType<typeof getForeignKeys>
          }>
      }
    | {
          patterns: Array<RegExp>
          rowExpander: (
              row: Record<string, string>,
          ) => Array<
              TableRowFromColumns<ReturnType<typeof getTableColumns<TTable>>>
          >
          config?: never
          missingRowResolver?: (
              missingData: Array<any>,
          ) => TableRowFromColumns<ReturnType<typeof getTableColumns<TTable>>>
          meta: Readonly<{
              tableName: string
              foreignKeys: ReturnType<typeof getForeignKeys>
          }>
      }

// Overall CSV config type
type CSVConfig<Tables extends Record<string, MySqlTable>> = {
    mappingConfig: {}
    [x: string]: {}
    tables: {
        [K in keyof Tables]: TableCSVConfig<Tables[K]>
    }
    schema: Tables
}

// --- Factory for multiple tables ---
export function createCSVConfig<Tables extends Record<string, MySqlTable<any>>>(
    schemas: Tables,
    overrides: {
        [K in keyof Tables]: Omit<TableCSVConfig<Tables[K]>, 'meta'> // meta auto-filled
    },
): CSVConfig<Tables> {
    const result: any = {
        schema: schemas,
        tables: {},
    }

    // Populate tables with meta information
    for (const key in schemas) {
        const table = schemas[key]
        const foreignKeys = getForeignKeys(table)
        const nameSym = Object.getOwnPropertySymbols(table).find((s) =>
            s.toString().includes('Name'),
        )
        const actualName = nameSym ? (table as any)[nameSym] : key

        const baseMeta = {
            tableName: actualName,
            foreignKeys,
        }

        // enforce full TableCSVConfig by re-merging and asserting
        const fullConfig = {
            ...overrides[key],
            meta: baseMeta,
        } as TableCSVConfig<typeof table>

        result.tables[key] = fullConfig
    }

    // Populate the metadata with the provided resolver if provided
    for (const key in overrides) {
        const tableConfig = result.tables[key]
        if (tableConfig && tableConfig.missingRowResolver) {
            tableConfig.meta.foreignKeys.forEach((fk: { resolver: any }) => {
                fk.resolver = tableConfig.missingRowResolver!
            })
        }
    }

    return result as CSVConfig<Tables>
}
