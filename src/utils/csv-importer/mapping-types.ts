import type { MySqlTable, MySqlColumn } from 'drizzle-orm/mysql-core'

// Extract only the table names from the schema object
export type ExtractTableNames<T> = {
    [K in keyof T]: T[K] extends MySqlTable<any> ? K : never
}[keyof T]

// Check if a column should be optional (has default OR is nullable)
type HasDefaultOrNullable<D, N> = D extends true
    ? true
    : N extends false
      ? true
      : false

// Extract if a column should be optional based on its internal structure
type ColumnIsOptional<C> =
    C extends MySqlColumn<infer Config, any>
        ? Config extends { hasDefault: infer D; notNull: infer N }
            ? HasDefaultOrNullable<D, N>
            : false
        : false

// Extract columns from a table and make columns with defaults optional
export type TableInsertType<T extends MySqlTable<any>> = {
    [
        K in keyof T['_']['columns'] as ColumnIsOptional<
            T['_']['columns'][K]
        > extends true
            ? never
            : K
    ]: T['_']['columns'][K]['_']['data']
} & {
    [
        K in keyof T['_']['columns'] as ColumnIsOptional<
            T['_']['columns'][K]
        > extends true
            ? K
            : never
    ]?: T['_']['columns'][K]['_']['data']
}

// Extract primary key column names from a table
export type ExtractPrimaryKeyColumns<T extends MySqlTable<any>> = {
    [K in keyof T['_']['columns']]: T['_']['columns'][K] extends {
        _: { isPrimaryKey: true }
    }
        ? K
        : never
}[keyof T['_']['columns']]

// Create a type for just the primary key fields
export type PrimaryKeyType<T extends MySqlTable<any>> = Pick<
    TableInsertType<T>,
    ExtractPrimaryKeyColumns<T>
>

export type MaybePromise<T> = T | Promise<T>

// Column mapping with proper type constraints
export type ColumnMapping<T> = {
    csvColumnName: string
    transform?: (val: string) => MaybePromise<T>
}

// Individual mapping entry (regex + config)
export type TableMapping<T extends MySqlTable<any>> =
    | {
          regex: RegExp[]
          config: {
              [C in keyof TableInsertType<T>]: ColumnMapping<
                  TableInsertType<T>[C]
              >
          }
          rowExpander?: never
      }
    | {
          regex: RegExp[]
          rowExpander: (
              row: Record<string, string>,
          ) => MaybePromise<TableInsertType<T>[]>
          config?: never
      }

// Create a type that requires a property for each table
export type TableConfig<T> = {
    [K in ExtractTableNames<T>]: T[K] extends MySqlTable<any>
        ? {
              mappings: Array<TableMapping<T[K]>>
              missingRowResolver?: (
                  missingData: PrimaryKeyType<T[K]>,
              ) => MaybePromise<TableInsertType<T[K]>>
          }
        : never
}
