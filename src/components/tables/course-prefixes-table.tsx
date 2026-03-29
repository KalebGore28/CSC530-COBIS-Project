import { EditableDataTable } from './editable-data-table'
import type { ColumnDef } from '@tanstack/react-table'
import { coursePrefixes } from '@/db/schema'
import { Checkbox } from '@/components/ui/checkbox'

const nullFilter = (row: any, columnId: string, filterValue: string) => {
    if (filterValue.toLowerCase() === 'null') {
        return row.getValue(columnId) == null
    }
    return String(row.getValue(columnId))
        .toLowerCase()
        .includes(filterValue.toLowerCase())
}

type CoursePrefixes = typeof coursePrefixes.$inferSelect

import { coursePrefixesCollection } from '@/integrations/tanstack-db/course-prefixes'

const columns: Array<ColumnDef<CoursePrefixes>> = [
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
]

export function CoursePrefixesTable({
    data,
    filterColumn,
    filterValue,
}: {
    data: Array<CoursePrefixes>
    filterColumn: string | undefined
    filterValue: string | undefined
}) {
    return (
        <EditableDataTable
            columns={columns}
            data={data}
            initialFilterColumn={filterColumn}
            initialFilterValue={filterValue}
            onBulkEdit={(selectedIds, column, value) => {
                // Update all selected rows
                coursePrefixesCollection.update(selectedIds, (drafts) => {
                    drafts.forEach((draft) => {
                        ;(draft as Record<string, any>)[column] = value
                    })
                })
            }}
        />
    )
}
