import { EditableDataTable } from './editable-data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { academicStanding } from '@/db/schema'
import { Checkbox } from '@/components/ui/checkbox'

type AcademicStanding = typeof academicStanding.$inferSelect

const columns: Array<ColumnDef<AcademicStanding>> = [
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

export function AcademicStandingTable({
    data,
    filterColumn,
    filterValue,
}: {
    data: Array<AcademicStanding>
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
