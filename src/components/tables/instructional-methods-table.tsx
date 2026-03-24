import { EditableDataTable } from './editable-data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { instructionalMethods } from '@/db/schema'
import { Checkbox } from '@/components/ui/checkbox'

type InstructionalMethods = typeof instructionalMethods.$inferSelect

const columns: Array<ColumnDef<InstructionalMethods>> = [
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
]

export function InstructionalMethodsTable({
    data,
    filterColumn,
    filterValue,
}: {
    data: Array<InstructionalMethods>
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
