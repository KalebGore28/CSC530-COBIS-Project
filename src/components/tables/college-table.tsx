import { EditableDataTable } from './editable-data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { colleges } from '@/db/schema'
import { Checkbox } from '@/components/ui/checkbox'

type College = typeof colleges.$inferSelect

const columns: Array<ColumnDef<College>> = [
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
        accessorKey: 'code',
        header: 'Code',
    },
    {
        accessorKey: 'description',
        header: 'Description',
    },
]

export function CollegeTable({
    data,
    defaultFilterColumn,
    defaultFilterColumnValue,
}: {
    data: Array<College>
    defaultFilterColumn?: string
    defaultFilterColumnValue?: string
}) {
    return (
        <EditableDataTable
            filterColumns={['code', 'description']}
            columns={columns}
            data={data}
        />
    )
}
