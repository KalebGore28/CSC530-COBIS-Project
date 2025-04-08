import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { ColumnDefinition, TableConfig, LookupCsvMapping, DataCsvMapping } from "../../types/csv-import-types";
import { AlertCircle, CheckCircle2, Columns, Key, Hash, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";


interface ColumnMapperProps {
  lookupTables: LookupCsvMapping[];
  selectedTable?: string;
  mapping: DataCsvMapping | null;
  onMapChange: (columnName: string, csvColumn: string) => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  lookupTables, // Used only for lookup tables
  selectedTable, // Used only when it is a lookup table so it can filter the lookup tables passed in.
  mapping, // This is the mapping for the data table.
  onMapChange,
}) => {

  if (mapping) {
    // We know it is a data table
    // we are interested in getting the destinations from the mapping
    // There can be multiple destinations for a single file. So that means multiple tables will need to be mapped.
    for (const destination of mapping.destinations) {

      // get the table name
      const tableName = destination.tableName;

      // get the csv columns
      const csvColumns = destination.columns.map((column) => column.csvColumn);

      // get the db columns
      const dbColumns = destination.columns.map((column) => column.dbColumn);

      // check if table has multiple primary keys.
      const hasMultiplePrimaryKeys = destination.columns.some((column) => column.isPrimaryKey);

      // the column mapping will have the following properties:
      // dbColumn: string;
      // csvColumn: string;
      // isPrimaryKey: boolean; // can have icon for this. 
      // hasTransform: boolean;

      // We will need to display the dbColumn and the csvColumn for each table.

      // the csvcolumn will be displayed. the dbcolumn will be displayed in a dropdown.

      // if possible try to match the csvcolumn to the dbcolumn.
      // only exact matches case insensitive will be auto mapped.

      // if there is no exact match, do not auto map.

    }

  } else {
    // We know it is a lookup table

    // we need to filter the lookup table to find the mapping for the selected table
    const lookupMapping = lookupTables.find((table) => table.destination.tableId === selectedTable);

    console.log(lookupMapping);
  }

  return (
    <div>
      <p>No mapping found for this table.</p>
    </div>
  )

};