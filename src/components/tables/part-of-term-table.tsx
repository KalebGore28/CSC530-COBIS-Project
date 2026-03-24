import { EditableDataTable } from './editable-data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { partOfTerm } from '@/db/schema'
import { Checkbox } from '@/components/ui/checkbox'

type PartOfTerm = typeof partOfTerm.$inferSelect

const columns: Array<ColumnDef<PartOfTerm>> = [
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

export function PartOfTermTable({
    data,
    filterColumn,
    filterValue,
}: {
    data: Array<PartOfTerm>
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
