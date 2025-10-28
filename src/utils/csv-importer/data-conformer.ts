import { Column } from "drizzle-orm";

/**
 * Conforms a given value to the specified column's data type and constraints.
 * @param value - The value to be conformed
 * @param column - The database column definition
 * @returns The conformed value
 */
export const dataConformer = (
  value: string | null | undefined,
  column: Column
) => {
  // Convert common null representations to actual null
  if (value === "NULL" || value === "null" || value === "") {
    value = null;
  }

  // Catch common data type conversions
  if (value === null || value === undefined) {

    // Handle auto-increment columns
    if ((column as any).autoIncrement) {
      return undefined;
    }

    // Handle hasDefault
    if (column.hasDefault && column.default !== undefined) {
      return column.default;
    }

    // Allow null for nullable columns
    if (column.notNull === false) {
      return null;
    }

    // Throw error if no conditions above are met
    throw new Error(`Null or undefined value for column: ${column.name}`);
  }

  // Basic type conversions from string to appropriate types
  switch (column.dataType) {
    case "string":
      return value;
    case "number":
      return parseInt(value, 10);
    case "boolean":
      // Check if value is a valid boolean representation
      const validBooleanValues = ["1", "0", "true", "false"];
      if (validBooleanValues.includes(value.toLowerCase())) {
        return value === "1" || value.toLowerCase() === "true";
      }
      throw new Error(`Invalid boolean value for column: ${column.name}`);
    default:
      throw new Error(`Not yet implemented data type conformity for: ${column.dataType}`);
  }

};