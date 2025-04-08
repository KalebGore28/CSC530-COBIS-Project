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
    const destinations = mapping.destinations;

    // We need to get the table name and the columns from the destinations
    const tableNames = destinations.map((destination) => destination.tableName);
    const columnMappings = destinations.map((destination) => destination.columns);

    console.log(tableNames);
    console.log(columnMappings);

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