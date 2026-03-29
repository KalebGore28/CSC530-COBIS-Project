import { EditableDataTable } from './editable-data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { departments } from '@/db/schema'
import { Checkbox } from '@/components/ui/checkbox'

const nullFilter = (row: any, columnId: string, filterValue: string) => {
    if (filterValue.toLowerCase() === 'null') {
        return row.getValue(columnId) == null
    }
    return String(row.getValue(columnId))
        .toLowerCase()
        .includes(filterValue.toLowerCase())
}

type Departments = typeof departments.$inferSelect

import { departmentsCollection } from '@/integrations/tanstack-db/departments'

const columns: Array<ColumnDef<Departments>> = [
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
        accessorKey: 'college_id',
        header: 'College ID',
        cell: ({ getValue }) => getValue() ?? '—', // or null
        filterFn: nullFilter,
    },
]

export function DepartmentsTable({
    data,
    filterColumn,
    filterValue,
}: {
    data: Array<Departments>
    filterColumn: string | undefined
    filterValue: string | undefined
}) {
    return (
        <EditableDataTable
            columns={columns}
            data={data}
            initialFilterColumn={filterColumn}
            initialFilterValue={filterValue}
            onBulkEdit={(selectedIds, _column, value) => {
                // Update all selected rows
                departmentsCollection.update(selectedIds, (drafts) => {
                    drafts.forEach((draft) => {
                        draft.description = value
                    })
                })
            }}
        />
    )
}
