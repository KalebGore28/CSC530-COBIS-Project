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
  lookupTables,
  selectedTable,
  mapping,
  onMapChange,
}) => {

  return (
    <div>
      <p>No mapping found for this table.</p>
    </div>
  )

};