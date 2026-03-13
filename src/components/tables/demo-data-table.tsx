import * as React from 'react'
import {
    type ColumnDef,
    type ColumnFiltersState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import {
    ArrowDownAZ,
    ArrowUpAZ,
    ChevronDown,
    Columns3,
    Edit,
    Filter,
    Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
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

// Sample data type
export type Product = {
    id: string
    name: string
    category: string
    price: number
    stock: number
    status: 'active' | 'inactive' | 'pending'
}

// Sample data
const sampleData: Product[] = [
    {
        id: 'P001',
        name: 'Wireless Mouse',
        category: 'Electronics',
        price: 29.99,
        stock: 145,
        status: 'active',
    },
    {
        id: 'P002',
        name: 'Mechanical Keyboard',
        category: 'Electronics',
        price: 89.99,
        stock: 67,
        status: 'active',
    },
    {
        id: 'P003',
        name: 'USB-C Cable',
        category: 'Accessories',
        price: 12.99,
        stock: 234,
        status: 'active',
    },
    {
        id: 'P004',
        name: 'Laptop Stand',
        category: 'Accessories',
        price: 45.99,
        stock: 89,
        status: 'pending',
    },
    {
        id: 'P005',
        name: 'Webcam HD',
        category: 'Electronics',
        price: 79.99,
        stock: 23,
        status: 'active',
    },
    {
        id: 'P006',
        name: 'Desk Lamp',
        category: 'Furniture',
        price: 34.99,
        stock: 0,
        status: 'inactive',
    },
    {
        id: 'P007',
        name: 'Monitor Arm',
        category: 'Accessories',
        price: 129.99,
        stock: 45,
        status: 'active',
    },
    {
        id: 'P008',
        name: 'Ergonomic Chair',
        category: 'Furniture',
        price: 299.99,
        stock: 12,
        status: 'pending',
    },
    {
        id: 'P009',
        name: 'Headphone Stand',
        category: 'Accessories',
        price: 19.99,
        stock: 156,
        status: 'active',
    },
    {
        id: 'P010',
        name: 'Drawing Tablet',
        category: 'Electronics',
        price: 199.99,
        stock: 34,
        status: 'active',
    },
]

// Column definitions
export const columns: ColumnDef<Product>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
            <div className="font-mono text-sm">{row.getValue('id')}</div>
        ),
    },
    {
        accessorKey: 'name',
        header: 'Product Name',
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('name')}</div>
        ),
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => <div>{row.getValue('category')}</div>,
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => {
            const price = Number.parseFloat(row.getValue('price'))
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(price)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
            const stock = row.getValue('stock') as number
            return (
                <div
                    className={
                        stock === 0
                            ? 'text-red-600'
                            : stock < 50
                              ? 'text-yellow-600'
                              : 'text-green-600'
                    }
                >
                    {stock}
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    {status}
                </div>
            )
        },
    },
]

export function DemoDataTable() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
        {},
    )

    // State for sort dropdown
    const [sortColumn, setSortColumn] = React.useState<string>('')
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
        'asc',
    )

    // State for filter
    const [filterColumn, setFilterColumn] = React.useState<string>('name')
    const [filterValue, setFilterValue] = React.useState<string>('')

    // State for bulk edit
    const [bulkEditColumn, setBulkEditColumn] = React.useState<string>('status')
    const [bulkEditValue, setBulkEditValue] = React.useState<string>('')

    const table = useReactTable({
        data: sampleData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        getRowId: (row) => row.id,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
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

    // Handle delete selected rows
    const handleDeleteSelected = () => {
        const selectedIds = Object.keys(rowSelection)
        console.log('Deleting rows with IDs:', selectedIds)
        // In a real app, you would delete from your data source here
        alert(
            `Would delete ${selectedIds.length} row(s): ${selectedIds.join(', ')}`,
        )
        setRowSelection({})
    }

    // Handle bulk edit
    const handleBulkEdit = () => {
        const selectedIds = Object.keys(rowSelection)
        console.log(
            `Updating column "${bulkEditColumn}" to "${bulkEditValue}" for rows:`,
            selectedIds,
        )
        // In a real app, you would update your data source here
        alert(
            `Would update ${selectedIds.length} row(s)\nColumn: ${bulkEditColumn}\nNew Value: ${bulkEditValue}`,
        )
    }

    return (
        <div className="w-full space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2">
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
                        <DropdownMenuContent align="start" className="w-56">
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
                                    <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                                        1
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-48 p-2">
                            <div className="space-y-2">
                                <div className="flex items-center text-center text-sm justify-between">
                                    <span>Sort By</span>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="sort-direction">
                                            {sortDirection === 'asc'
                                                ? 'Ascending'
                                                : 'Descending'}
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
                                                            className="font-normal capitalize cursor-pointer"
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
                                    <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                                        {columnFilters.length}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">
                                        Filter Data
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
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
                                                <SelectValue />
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
                        <>
                            <Separator orientation="vertical" />
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-9 gap-2"
                                onClick={handleDeleteSelected}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>
                                    Delete {selectedRowCount}{' '}
                                    {selectedRowCount === 1 ? 'row' : 'rows'}
                                </span>
                            </Button>
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
                                            <h4 className="font-medium leading-none">
                                                Bulk Edit
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Update a column value for all{' '}
                                                {selectedRowCount} selected
                                                row(s)
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
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="status">
                                                            Status
                                                        </SelectItem>
                                                        <SelectItem value="category">
                                                            Category
                                                        </SelectItem>
                                                        <SelectItem value="price">
                                                            Price
                                                        </SelectItem>
                                                        <SelectItem value="stock">
                                                            Stock
                                                        </SelectItem>
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
                                            disabled={!bulkEditValue}
                                        >
                                            Update {selectedRowCount} Row(s)
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </>
                    )}
                </div>

                <div className="text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} of{' '}
                    {sampleData.length} row (s)
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card shadow-sm">
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
        </div>
    )
}
