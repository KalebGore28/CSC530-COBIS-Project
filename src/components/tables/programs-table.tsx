import { EditableDataTable } from './editable-data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { programs } from '@/db/schema'
import { Checkbox } from '@/components/ui/checkbox'

const nullFilter = (row: any, columnId: string, filterValue: string) => {
    if (filterValue.toLowerCase() === 'null') {
        return row.getValue(columnId) == null
    }
    return String(row.getValue(columnId))
        .toLowerCase()
        .includes(filterValue.toLowerCase())
}

type Programs = typeof programs.$inferSelect

const columns: Array<ColumnDef<Programs>> = [
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
    },
    {
        accessorKey: 'id',
        header: 'Id',
    },
    {
        accessorKey: 'description',
        header: 'Description',
    },
    {
        accessorKey: 'is_major',
        header: 'Major',
    },
    {
        accessorKey: 'is_minor',
        header: 'Minor',
    },
    {
        accessorKey: 'has_concentration',
        header: 'Has Concentration',
    },
    {
        accessorKey: 'is_discontinued',
        header: 'Is Discontinued',
    },
    {
        accessorKey: 'is_aacsb',
        header: 'AACSB',
    },
    {
        accessorKey: 'department_id',
        header: 'Department ID',
        cell: ({ getValue }) => getValue() ?? '—', // or null
        filterFn: nullFilter,
    },
    {
        accessorKey: 'college_id',
        header: 'College ID',
        cell: ({ getValue }) => getValue() ?? '—', // or null
        filterFn: nullFilter,
    },
    {
        accessorKey: 'coordinator',
        header: 'Coordinator M#',
        cell: ({ getValue }) => getValue() ?? '—', // or null
        filterFn: nullFilter,
    },
    {
        accessorKey: 'last_updated',
        header: 'Last Updated',
    },
]

export function ProgramsTable({
    data,
    filterColumn,
    filterValue,
}: {
    data: Array<Programs>
    filterColumn: string | undefined
    filterValue: string | undefined
}) {
    return (
        <EditableDataTable
            columns={columns}
            data={data}
            initialFilterColumn={filterColumn}
            initialFilterValue={filterValue}
        />
    )
}
