import { EditableDataTable } from './editable-data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { courses } from '@/db/schema'
import { Checkbox } from '@/components/ui/checkbox'

const nullFilter = (row: any, columnId: string, filterValue: string) => {
    if (filterValue.toLowerCase() === 'null') {
        return row.getValue(columnId) == null
    }
    return String(row.getValue(columnId))
        .toLowerCase()
        .includes(filterValue.toLowerCase())
}

type Courses = typeof courses.$inferSelect

import { coursesCollection } from '@/integrations/tanstack-db/courses'

const columns: Array<ColumnDef<Courses>> = [
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
        accessorKey: 'subject',
        header: 'Subject',
    },
    {
        accessorKey: 'number',
        header: 'Number',
        filterFn: 'includesString',
    },
    {
        accessorKey: 'suffix',
        header: 'Suffix',
    },
    {
        accessorKey: 'title',
        header: 'Title',
    },
    {
        accessorKey: 'hours',
        header: 'Hours',
        filterFn: 'includesString',
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
        accessorKey: 'last_updated',
        header: 'Last Updated',
        cell: ({ getValue }) => {
            const value = getValue()
            if (!value) return '—'
            const date = new Date(value as string | number | Date)
            return date.toLocaleDateString()
        },
    },
]

export function CoursesTable({
    data,
    filterColumn,
    filterValue,
}: {
    data: Array<Courses>
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
                coursesCollection.update(selectedIds, (drafts) => {
                    drafts.forEach((draft) => {
                        ;(draft as Record<string, any>)[column] = value
                    })
                })
            }}
        />
    )
}
