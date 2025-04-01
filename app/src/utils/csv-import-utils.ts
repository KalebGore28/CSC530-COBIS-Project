// csv-import-utils.ts - Utility functions for CSV importing

import { TableConfig } from '../types/csv-import-types';

// File pattern mapping for automatic table detection
export const filePatterns = [
  {
    pattern: /reg_cuba_test_scores_\d+_\d+\.csv$/i,
    tableName: "test_scores",
    description: "Test scores data"
  },
  {
    pattern: /reg_cuba_demographic_\d+_\d+\.csv$/i,
    tableName: "demographics",
    description: "Student demographic information"
  },
  {
    pattern: /reg_cuba_overrides_\d+_\d+\.csv$/i,
    tableName: "overrides",
    description: "Override information"
  },
  {
    pattern: /reg_cuba_prev_colleges_\d+_\d+\.csv$/i,
    tableName: "previous_colleges",
    description: "Previous college information"
  },
  {
    pattern: /reg_cuba_courses_during_term_\d+_\d+\.csv$/i,
    tableName: "courses_during_term",
    description: "Courses taken during term"
  },
  {
    pattern: /reg_cuba_catalog_\d+_\d+\.csv$/i,
    tableName: "course_catalog",
    description: "Course catalog data"
  },
  {
    pattern: /\d+_REG_CUBA_Courses_Grade_Time_Extract_\d+\.csv$/i,
    tableName: "courses_during_term",
    description: "End of term course data"
  },
  {
    pattern: /\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i,
    tableName: "demographics",
    description: "End of term demographic data"
  },
];

// Auto column mapping - exact matches only
export const autoMapColumns = (
  headers: string[],
  fields: string[]
): Record<string, string> => {
  const mapping: Record<string, string> = {};

  // Create lowercase lookup for case-insensitive matching
  const headersLowerMap = new Map<string, string>();
  headers.forEach(header => {
    headersLowerMap.set(header.toLowerCase(), header);
  });

  // Only do exact case-insensitive matching
  fields.forEach(field => {
    const matchedHeader = headersLowerMap.get(field.toLowerCase());
    if (matchedHeader) {
      mapping[field] = matchedHeader;
    } else {
      mapping[field] = "";
    }
  });

  return mapping;
};

// Enhanced column auto-mapping function
export const detectTableFromFilename = (
  fileName: string,
  tables: TableConfig[]
): { tableName: string } | null => {
  console.log(`Detecting table for file: ${fileName}`);
  
  // Don't filter by category since it's not available
  // Instead, treat all tables as potential matches
  
  for (const pattern of filePatterns) {
    if (pattern.pattern.test(fileName)) {
      console.log(`File matches pattern for type: ${pattern.tableName}`);
      
      // Find exact match to the tableType
      const exactTable = tables.find(t => {
        console.log(`Checking table: ${t.name}`, t.name.toLowerCase() === pattern.tableName.toLowerCase())
        return t.name.toLowerCase() === pattern.tableName.toLowerCase();
      }
      );
      
      // If no exact match, try to find a table with a name containing the tableType
      if (!exactTable) {
        const similarTable = tables.find(t =>
          t.name.toLowerCase().includes(pattern.tableName.toLowerCase())
        );
        
        if (similarTable) {
          console.log(`Found similar table match: ${similarTable.name}`);
          return {
            tableName: similarTable.name
          };
        }
      } else {
        console.log(`Found exact table match: ${exactTable.name}`);
        return {
          tableName: exactTable.name
        };
      }
      
      break;
    }
  }

  console.log(`No matching table found for ${fileName}`);
  return null;
};

// Find matching table based on column headers
export const findMatchingTable = (
  headers: string[],
  tables: TableConfig[]
): { tableName: string; category: "lookup" | "data"; mapping: Record<string, string> } | null => {
  // Create a lowercase lookup of headers for quick matching
  const headerLookupSet = new Set(headers.map(h => h.toLowerCase()));

  let bestTableMatch = { tableName: "", matchCount: 0, exactMatchPercentage: 0 };

  for (const table of tables) {
    // Count exact matches (case insensitive)
    const exactMatches = table.fields.filter(field =>
      headerLookupSet.has(field.toLowerCase())
    ).length;

    // Calculate what percentage of required fields have exact matches
    const exactMatchPercentage = table.fields.length > 0
      ? (exactMatches / table.fields.length) * 100
      : 0;

    // Prioritize tables with higher exact match percentage
    if (exactMatchPercentage > bestTableMatch.exactMatchPercentage ||
      (exactMatchPercentage === bestTableMatch.exactMatchPercentage &&
        exactMatches > bestTableMatch.matchCount)) {
      bestTableMatch = {
        tableName: table.name,
        matchCount: exactMatches,
        exactMatchPercentage: exactMatchPercentage
      };
    }
  }

  // Only suggest if we have a high match percentage (at least 50%)
  if (bestTableMatch.exactMatchPercentage >= 80 && bestTableMatch.tableName) {
    const suggestedTable = tables.find(t => t.name === bestTableMatch.tableName);
    if (suggestedTable) {
      // Generate mapping with strict matching only
      const newMapping = autoMapColumns(headers, suggestedTable.fields);
      return {
        tableName: suggestedTable.name,
        mapping: newMapping
      };
    }
  }

  return null;
};

// Map CSV data to the expected format
export const mapCsvDataToFields = (
  data: string[][],
  headers: string[],
  mapping: Record<string, string>,
  fields: string[]
): Record<string, string>[] => {
  return data.map((row) => {
    const rowData: Record<string, string> = {};
    fields.forEach((field) => {
      const csvColumn = mapping[field];
      const columnIndex = headers.indexOf(csvColumn);
      rowData[field] = columnIndex >= 0 ? row[columnIndex] || "" : "";
    });
    return rowData;
  });
};