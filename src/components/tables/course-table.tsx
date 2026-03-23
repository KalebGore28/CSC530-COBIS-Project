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

type Course = typeof courses.$inferSelect

const columns: Array<ColumnDef<Course>> = [
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
        accessorKey: 'department_code',
        header: 'Department Code',
        cell: ({ getValue }) => getValue() ?? '—', // or null
        filterFn: nullFilter,
    },
    {
        accessorKey: 'college_code',
        header: 'College Code',
        cell: ({ getValue }) => getValue() ?? '—', // or null
        filterFn: nullFilter,
    },
    {
        accessorKey: 'last_updated',
        header: 'Last Updated',
    },
]

export function CourseTable({ data }: { data: Array<Course> }) {
    return <EditableDataTable columns={columns} data={data} />
}
