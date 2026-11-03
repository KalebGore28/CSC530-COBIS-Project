import * as React from "react";
import { useLiveQuery } from "@tanstack/react-db";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Edit,
  Filter,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { collegesCollection } from "@/integrations/tanstack-db/colleges";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns,
  sortFns,
});

export type EditableColumnDef<TData extends RowData> = ColumnDef<typeof features, TData>;

// How bulk edit asks for a new value: free text, on/off, or a pick from the real departments or colleges
export type EditKind = "text" | "boolean" | "department" | "college";

type EditValue = string | boolean | null;

// Typing "null" finds empty values, anything else finds values containing the text
function emptyOrContains(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: string,
) {
  const value = row.getValue(columnId);
  if (filterValue.toLowerCase() === "null") return value == null;
  return String(value).toLowerCase().includes(filterValue.toLowerCase());
}

function getColumnLabel<TData extends RowData>(column: Column<typeof features, TData, unknown>) {
  const header = column.columnDef.header;
  return typeof header === "string" ? header : column.id;
}

interface EditableDataTableProps<TData extends RowData> {
  columns: Array<EditableColumnDef<TData>>;
  data: Array<TData>;
  // Columns that bulk edit can change, and what kind of value each takes
  editableColumns: Partial<Record<keyof TData & string, EditKind>>;
  onSave: (ids: Array<string>, changes: Partial<Record<keyof TData & string, EditValue>>) => void;
  initialFilterColumn?: string;
  initialFilterValue?: string;
}

export function EditableDataTable<TData extends RowData>({
  columns,
  data,
  editableColumns,
  onSave,
  initialFilterColumn,
  initialFilterValue,
}: EditableDataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [sortDescending, setSortDescending] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(() =>
    initialFilterColumn && initialFilterValue
      ? [{ id: initialFilterColumn, value: initialFilterValue }]
      : [],
  );
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // The filter popover edits these, and Apply copies them into the table's filter
  const [filterColumn, setFilterColumn] = React.useState(initialFilterColumn ?? "");
  const [filterValue, setFilterValue] = React.useState(initialFilterValue ?? "");

  const [bulkEditColumn, setBulkEditColumn] = React.useState("");
  const [bulkEditValue, setBulkEditValue] = React.useState<EditValue | undefined>(undefined);
  const [isBulkEditOpen, setIsBulkEditOpen] = React.useState(false);

  const { data: departments } = useLiveQuery((q) =>
    q
      .from({ departments: departmentsCollection })
      .orderBy(({ departments }) => departments.description, "asc"),
  );
  const { data: colleges } = useLiveQuery((q) =>
    q.from({ colleges: collegesCollection }).orderBy(({ colleges }) => colleges.description, "asc"),
  );

  const selectColumn: EditableColumnDef<TData> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
  };

  const table = useTable({
    features,
    data,
    columns: [selectColumn, ...columns],
    defaultColumn: { filterFn: emptyOrContains },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => (row as { id: string }).id,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const selectedIds = Object.keys(rowSelection);
  const sortColumn = sorting.at(0)?.id ?? "";
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const firstShownRow = filteredRowCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const lastShownRow = Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredRowCount);

  const bulkEditKind = editableColumns[bulkEditColumn as keyof TData & string];
  const canBulkEdit =
    !!bulkEditKind &&
    (bulkEditKind === "text"
      ? typeof bulkEditValue === "string" && bulkEditValue.trim() !== ""
      : bulkEditValue !== undefined);

  const handleSortColumnChange = (columnId: string) => {
    setSorting([{ id: columnId, desc: sortDescending }]);
  };

  const handleSortDirectionChange = (descending: boolean) => {
    setSortDescending(descending);
    if (sortColumn) setSorting([{ id: sortColumn, desc: descending }]);
  };

  // A new filter can hide selected rows, so the selection starts over to keep bulk edit to visible rows
  const handleApplyFilter = () => {
    setColumnFilters(filterColumn && filterValue ? [{ id: filterColumn, value: filterValue }] : []);
    setRowSelection({});
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const handleClearFilter = () => {
    setFilterValue("");
    setColumnFilters([]);
    setRowSelection({});
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const handleBulkEditColumnChange = (columnId: string) => {
    setBulkEditColumn(columnId);
    // A switch starts off, the other kinds start empty until a value is chosen
    setBulkEditValue(
      editableColumns[columnId as keyof TData & string] === "boolean" ? false : undefined,
    );
  };

  const handleBulkEdit = () => {
    if (!canBulkEdit || bulkEditValue === undefined) return;

    const value = bulkEditKind === "text" ? (bulkEditValue as string).trim() : bulkEditValue;
    onSave(selectedIds, { [bulkEditColumn]: value } as Partial<
      Record<keyof TData & string, EditValue>
    >);

    setRowSelection({});
    setBulkEditColumn("");
    setBulkEditValue(undefined);
    setIsBulkEditOpen(false);
  };

  const pickerOptions =
    bulkEditKind === "department"
      ? departments.map((d) => ({ id: d.id, label: d.description }))
      : colleges.map((c) => ({ id: c.id, label: c.description }));

  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-(--card-spacing)">
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3 />
                Columns
                <ChevronDown className="opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Show columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {getColumnLabel(column)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {sortDescending ? <ArrowDownAZ /> : <ArrowUpAZ />}
                Sort
                {sortColumn && <Badge>1</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56">
              <div className="flex items-center justify-between">
                <span className="font-medium">Sort by</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor="sort-direction" className="text-muted-foreground font-normal">
                    {sortDescending ? "Descending" : "Ascending"}
                  </Label>
                  <Switch
                    id="sort-direction"
                    size="sm"
                    checked={sortDescending}
                    onCheckedChange={handleSortDirectionChange}
                  />
                </div>
              </div>
              <Separator />
              <RadioGroup value={sortColumn} onValueChange={handleSortColumnChange}>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanSort())
                  .map((column) => (
                    <div key={column.id} className="flex items-center gap-2">
                      <RadioGroupItem value={column.id} id={`sort-${column.id}`} />
                      <Label htmlFor={`sort-${column.id}`} className="font-normal">
                        {getColumnLabel(column)}
                      </Label>
                    </div>
                  ))}
              </RadioGroup>
              {sortColumn && (
                <Button variant="outline" className="w-full" onClick={() => setSorting([])}>
                  Clear sorting
                </Button>
              )}
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter />
                Filter
                {columnFilters.length > 0 && <Badge>{columnFilters.length}</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div>
                <p className="font-medium">Filter rows</p>
                <p className="text-muted-foreground">Type null to find empty values.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-column">Column</Label>
                <Select value={filterColumn} onValueChange={setFilterColumn}>
                  <SelectTrigger id="filter-column" className="w-full">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanFilter())
                      .map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {getColumnLabel(column)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-value">Value</Label>
                <Input
                  id="filter-value"
                  placeholder="Enter a value..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyFilter();
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleClearFilter}>
                  Clear
                </Button>
                <Button className="flex-1" onClick={handleApplyFilter}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {selectedIds.length > 0 && (
            <Popover open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Edit />
                  Edit {selectedIds.length} selected
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div>
                  <p className="font-medium">Bulk edit</p>
                  <p className="text-muted-foreground">
                    Set one column for the {selectedIds.length} selected row(s).
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk-edit-column">Column</Label>
                  <Select value={bulkEditColumn} onValueChange={handleBulkEditColumnChange}>
                    <SelectTrigger id="bulk-edit-column" className="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {table
                        .getAllColumns()
                        .filter((column) => column.id in editableColumns)
                        .map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {getColumnLabel(column)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {bulkEditKind === "text" && (
                  <div className="space-y-2">
                    <Label htmlFor="bulk-edit-value">New value</Label>
                    <Input
                      id="bulk-edit-value"
                      placeholder="Enter a value..."
                      value={typeof bulkEditValue === "string" ? bulkEditValue : ""}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleBulkEdit();
                      }}
                    />
                  </div>
                )}

                {bulkEditKind === "boolean" && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bulk-edit-value">New value</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{bulkEditValue ? "Yes" : "No"}</span>
                      <Switch
                        id="bulk-edit-value"
                        checked={bulkEditValue === true}
                        onCheckedChange={setBulkEditValue}
                      />
                    </div>
                  </div>
                )}

                {(bulkEditKind === "department" || bulkEditKind === "college") && (
                  <div className="space-y-2">
                    <Label>New value</Label>
                    <Command className="rounded-lg border">
                      <CommandInput placeholder="Search..." />
                      <CommandList className="max-h-48">
                        <CommandEmpty>Nothing found</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            data-checked={bulkEditValue === null}
                            onSelect={() => setBulkEditValue(null)}
                          >
                            None
                          </CommandItem>
                          {pickerOptions.map((option) => (
                            <CommandItem
                              key={option.id}
                              value={`${option.label} ${option.id}`}
                              data-checked={bulkEditValue === option.id}
                              onSelect={() => setBulkEditValue(option.id)}
                            >
                              {option.label} ({option.id})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}

                <Button className="w-full" onClick={handleBulkEdit} disabled={!canBulkEdit}>
                  Update {selectedIds.length} row(s)
                </Button>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-28" aria-label="Rows per page">
              <SelectValue>{pagination.pageSize} rows</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="25">25 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
              <SelectItem value="100">100 rows</SelectItem>
              <SelectItem value="200">200 rows</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">
            {filteredRowCount === 0
              ? "No rows"
              : `Showing ${firstShownRow}–${lastShownRow} of ${filteredRowCount}`}
          </span>
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="first:pl-(--card-spacing) last:pr-(--card-spacing)"
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="first:pl-(--card-spacing) last:pr-(--card-spacing)"
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getVisibleLeafColumns().length}
                className="text-muted-foreground h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CardFooter className="justify-between gap-2">
        <span className="text-muted-foreground">
          Page {pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
