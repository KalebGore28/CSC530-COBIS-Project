import type { MySqlTable, MySqlColumn } from "drizzle-orm/mysql-core";
import { getTableColumns } from "drizzle-orm";

// --- Detect whether a column has a default or is nullable ---
type ColumnHasDefault<C> =
  C extends { config: { hasDefault: infer D, notNull: infer N } }
  ? D extends true
  ? true
  : N extends false
  ? true
  : false
  : C extends MySqlColumn<infer Col, any, any>
  ? Col["hasDefault"] extends true
  ? true
  : Col["notNull"] extends false
  ? true
  : false
  : false;

// --- Column config props, conditional on whether it has a default ---
type ColumnConfigProps<HasDefault extends boolean> = {
  csvColumnName: string | string[];
  transform?: (value: any) => any;
} & (HasDefault extends true
  ? { forcedConform?: boolean } // only available when column has default
  : {}); // otherwise not allowed at all

// --- Map table columns to configuration objects ---
type TableConfig<T extends Record<string, any>> = {
  // Optional columns (have default)
  [K in keyof T as ColumnHasDefault<T[K]> extends true ? K : never]?: ColumnConfigProps<true>;
} & {
  // Required columns (no default)
  [K in keyof T as ColumnHasDefault<T[K]> extends false ? K : never]: ColumnConfigProps<false>;
};

// --- Generic function that infers the config type ---
function createTableConfig<TTable extends MySqlTable<any>>(table: TTable) {
  const columns = getTableColumns(table);
  type Config = TableConfig<typeof columns>;
  return {} as Config;
}

// --- Per-table CSV config ---
type TableCSVConfig<TableConfig> = {
  patterns: RegExp[];
  config: TableConfig;
  rowExpander?: (row: any) => Record<string, any>[];
};

// --- Overall CSV config for all tables ---
type CSVConfig<Tables extends Record<string, MySqlTable>> = {
  tables: {
    [K in keyof Tables]: TableCSVConfig<ReturnType<typeof createTableConfig<Tables[K]>>>;
  };
  schema: Tables;
};

// --- Factory for multiple tables ---
export function createCSVConfig<Tables extends Record<string, MySqlTable>>(
  schemas: Tables
): CSVConfig<Tables> {
  const result: any = {
    schema: schemas,
    tables: {},
  };
  for (const tableName in schemas) {
    const table = schemas[tableName];
    if (!table) continue;
    result.tables[tableName] = {
      patterns: [],
      config: createTableConfig(table),
    };
  }
  return result;
}