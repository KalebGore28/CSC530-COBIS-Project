import * as React from 'react'
import {
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import {
    ArrowDownAZ,
    ArrowUpAZ,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Columns3,
    Edit,
    Filter,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '../ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[]
    data: TData[]
    initialFilterColumn?: string
    initialFilterValue?: string
    onBulkEdit?: (selectedIds: string[], column: string, value: string) => void
}

export function EditableDataTable<TData>({
    columns,
    data,
    initialFilterColumn,
    initialFilterValue,
    onBulkEdit,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>(() => {
            if (initialFilterColumn && initialFilterValue) {
                return [{ id: initialFilterColumn, value: initialFilterValue }]
            }
            return []
        })
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
        {},
    )
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    // State for sort dropdown
    const [sortColumn, setSortColumn] = React.useState<string>('')
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
        'asc',
    )

    // State for filter
    const [filterColumn, setFilterColumn] = React.useState<string>(
        initialFilterColumn ?? '',
    )
    const [filterValue, setFilterValue] = React.useState<string>(
        initialFilterValue ?? '',
    )

    // State for bulk edit
    const [bulkEditColumn, setBulkEditColumn] = React.useState<string>('')
    const [bulkEditValue, setBulkEditValue] = React.useState<string>('')

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
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
    })

    const selectedRowCount = Object.keys(rowSelection).length

    // Auto-apply sorting when sort settings change
    React.useEffect(() => {
        if (sortColumn) {
            setSorting([{ id: sortColumn, desc: sortDirection === 'desc' }])
        } else {
            setSorting([])
        }
    }, [sortColumn, sortDirection])

    // Apply filter
    const handleApplyFilter = () => {
        if (filterColumn && filterValue) {
            setColumnFilters([{ id: filterColumn, value: filterValue }])
        } else {
            setColumnFilters([])
        }
    }

    // Clear filter
    const handleClearFilter = () => {
        setFilterValue('')
        setColumnFilters([])
    }

    // Handle bulk edit
    const handleBulkEdit = () => {
        const selectedIds = Object.keys(rowSelection)

        // Call the callback if provided
        if (onBulkEdit) {
            onBulkEdit(selectedIds, bulkEditColumn, bulkEditValue)
        }

        // Reset selection and bulk edit state
        setRowSelection({})
        setBulkEditColumn('')
        setBulkEditValue('')
    }

    return (
        <div className="w-full space-y-4">
            {/* Toolbar */}
            <div className="bg-card flex flex-wrap items-center justify-between gap-2 rounded-lg border p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Columns Button */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-2"
                            >
                                <Columns3 className="h-4 w-4" />
                                Columns
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuLabel>
                                Toggle Columns
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort Button */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-2"
                            >
                                {sortDirection === 'asc' ? (
                                    <ArrowUpAZ className="h-4 w-4" />
                                ) : (
                                    <ArrowDownAZ className="h-4 w-4" />
                                )}
                                Sort
                                {sortColumn && (
                                    <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 py-0.5 text-xs">
                                        1
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-48 p-2">
                            <div className="space-y-2">
                                <div className="text-muted-foreground flex items-center justify-between text-center text-xs font-medium">
                                    <span>Sort By</span>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="sort-direction">
                                            <span>
                                                {sortDirection === 'asc'
                                                    ? 'Ascending'
                                                    : 'Descending'}
                                            </span>
                                        </Label>
                                        <Switch
                                            id="sort-direction"
                                            size="sm"
                                            checked={sortDirection === 'desc'}
                                            onCheckedChange={(checked) =>
                                                setSortDirection(
                                                    checked ? 'desc' : 'asc',
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="space-y-3">
                                        <RadioGroup
                                            value={sortColumn}
                                            onValueChange={setSortColumn}
                                        >
                                            {table
                                                .getAllColumns()
                                                .filter((column) =>
                                                    column.getCanSort(),
                                                )
                                                .map((column) => (
                                                    <div
                                                        key={column.id}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <RadioGroupItem
                                                            value={column.id}
                                                            id={`sort-${column.id}`}
                                                        />
                                                        <Label
                                                            htmlFor={`sort-${column.id}`}
                                                            className="cursor-pointer font-normal capitalize"
                                                        >
                                                            {column.id}
                                                        </Label>
                                                    </div>
                                                ))}
                                        </RadioGroup>
                                    </div>
                                </div>
                                {sortColumn && (
                                    <>
                                        <Separator />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setSortColumn('')
                                                setSorting([])
                                            }}
                                        >
                                            Clear Sorting
                                        </Button>
                                    </>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Filter Button */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-2"
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                                {columnFilters.length > 0 && (
                                    <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 py-0.5 text-xs">
                                        {columnFilters.length}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="leading-none font-medium">
                                        Filter Data
                                    </h4>
                                    <p className="text-muted-foreground text-sm">
                                        Filter table by column values
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="filter-column"
                                            className="text-xs"
                                        >
                                            Column
                                        </Label>
                                        <Select
                                            value={filterColumn}
                                            onValueChange={setFilterColumn}
                                        >
                                            <SelectTrigger id="filter-column">
                                                <SelectValue placeholder="Select column" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {table
                                                    .getAllColumns()
                                                    .filter((column) =>
                                                        column.getCanFilter(),
                                                    )
                                                    .map((column) => (
                                                        <SelectItem
                                                            key={column.id}
                                                            value={column.id}
                                                            className="capitalize"
                                                        >
                                                            {column.id}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="filter-value"
                                            className="text-xs"
                                        >
                                            Value
                                        </Label>
                                        <Input
                                            id="filter-value"
                                            placeholder="Enter filter value..."
                                            value={filterValue}
                                            onChange={(e) =>
                                                setFilterValue(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleApplyFilter()
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleClearFilter}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1"
                                        onClick={handleApplyFilter}
                                    >
                                        Apply Filter
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Selection Actions - Show when rows are selected */}
                    {selectedRowCount > 0 && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Selected
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="leading-none font-medium">
                                            Bulk Edit
                                        </h4>
                                        <p className="text-muted-foreground text-sm">
                                            Update a column value for all{' '}
                                            {selectedRowCount} selected row(s)
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="bulk-edit-column"
                                                className="text-xs"
                                            >
                                                Column to Update
                                            </Label>
                                            <Select
                                                value={bulkEditColumn}
                                                onValueChange={
                                                    setBulkEditColumn
                                                }
                                            >
                                                <SelectTrigger id="bulk-edit-column">
                                                    <SelectValue placeholder="Select column" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {table
                                                        .getAllColumns()
                                                        .filter(
                                                            (column) =>
                                                                column.getCanHide() &&
                                                                column.id !==
                                                                    'select',
                                                        )
                                                        .map((column) => (
                                                            <SelectItem
                                                                key={column.id}
                                                                value={
                                                                    column.id
                                                                }
                                                                className="capitalize"
                                                            >
                                                                {column.id}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="bulk-edit-value"
                                                className="text-xs"
                                            >
                                                New Value
                                            </Label>
                                            <Input
                                                id="bulk-edit-value"
                                                placeholder="Enter new value..."
                                                value={bulkEditValue}
                                                onChange={(e) =>
                                                    setBulkEditValue(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleBulkEdit()
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={handleBulkEdit}
                                        disabled={
                                            !bulkEditColumn || !bulkEditValue
                                        }
                                    >
                                        Update {selectedRowCount} Row(s)
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Page Size Selector */}
                    <Select
                        value={pagination.pageSize.toString()}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger
                            id="page-size"
                            className="h-full w-32 gap-2 rounded-md"
                        >
                            <SelectValue className="h-full">
                                {pagination.pageSize} rows
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 rows</SelectItem>
                            <SelectItem value="25">25 rows</SelectItem>
                            <SelectItem value="50">50 rows</SelectItem>
                            <SelectItem value="100">100 rows</SelectItem>
                            <SelectItem value="200">200 rows</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="text-muted-foreground text-sm">
                        Showing {table.getState().pagination.pageSize} of{' '}
                        {table.getFilteredRowModel().rows.length} row(s)
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="font-semibold"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                    className="hover:bg-muted/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="bg-card flex items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="text-muted-foreground text-sm">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-9 gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-9 gap-2"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
