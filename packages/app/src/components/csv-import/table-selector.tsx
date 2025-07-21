import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { CSVFileMappingWithMetadata } from "@/services/csv-import-service";
import {
  getMappingByName,
  getMappingByFilePattern,
  getAllLookupMappingNames,
} from "@/services/csv-import-service";

import { Database, Table2, Info } from "lucide-react";

interface TableSelectorProps {
  file: File | null;
  selectedMapping: CSVFileMappingWithMetadata | null;
  onSelectedMappingChange: (mapping: CSVFileMappingWithMetadata | null) => void;
}

import { useEffect, useState } from "react";

export const TableSelector: React.FC<TableSelectorProps> = ({
  file,
  selectedMapping,
  onSelectedMappingChange,
}) => {
  const [lookupTables, setLookupTables] = useState<string[]>([]);
  const [selectedLookupTable, setSelectedLookupTable] = useState<string | null>(null);

  // Fetch mappings asynchronously when file changes
  useEffect(() => {
    const fetchMappings = async () => {
      if (file?.name) {
        const mappings = await getMappingByFilePattern(file.name);
        onSelectedMappingChange(mappings);
      } else {
        onSelectedMappingChange(null);
      }
      setLookupTables(await getAllLookupMappingNames());
    };
    fetchMappings();
  }, [file]);

  // If no mapping is found, assume it's a lookup table
  if (!selectedMapping || selectedMapping.category === "lookup") {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">
            Select Lookup Table
          </h3>
          <div className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-200 flex items-center">
            <Table2 className="h-3 w-3 mr-1" /> Lookup Import
          </div>
        </div>
        <div className="p-3 bg-amber-50 rounded-md border border-amber-200 mb-4">
          <div className="flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
            <div className="text-sm text-amber-800">
              <p>No matching file pattern found for this file. You can use it as a lookup table import.</p>
              <p className="mt-2 font-medium">Please select a lookup table to continue.</p>
            </div>
          </div>
        </div>
        <Select
          value={selectedLookupTable || ""}
          onValueChange={async (value) => {
            setSelectedLookupTable(value);
            onSelectedMappingChange(await getMappingByName(value));
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a lookup table" />
          </SelectTrigger>
          <SelectContent>
            {lookupTables.map(lookupTable => (
              <SelectItem
                key={lookupTable}
                value={lookupTable}
              >
                {lookupTable}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // For data tables, show the destination table(s)
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium"> Destination Tables </h3>
        <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 flex items-center">
          <Database className="h-3 w-3 mr-1" /> Data Import
        </div>
      </div>

      {selectedMapping?.category === 'data' && (
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">This data file will import to the following tables:</p>
              <ul className="list-disc pl-5 space-y-1">
                {selectedMapping.destinations.map(table => (
                  <li key={table.schemaRef.name}>
                    <span className="font-medium">{table.schemaRef.name}</span>
                    {table.rowExpander && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Row Expander</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};