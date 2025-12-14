import type { ColumnDef } from '@tanstack/react-table'
import type { JSX } from 'react'
import { DataTable } from '@/components/tables/data-table'

type CurrentTermCourse = {
    course: string
    title: string
    credit_hour: number
    total_students: number
    total_credit_hours: number
    action: JSX.Element
}

const columns: Array<ColumnDef<CurrentTermCourse>> = [
    {
        accessorKey: 'course',
        header: 'Course',
    },
    {
        accessorKey: 'title',
        header: 'Title',
    },
    {
        accessorKey: 'credit_hour',
        header: 'Credit Hour',
    },
    {
        accessorKey: 'total_credit_hours',
        header: 'Total Credit Hours',
    },
    {
        accessorKey: 'total_students',
        header: 'Total Students',
    },
    {
        header: 'Action',
        cell: ({ row }) => row.original.action, // render the JSX
    },
]

export function CoursesTable({ data }: { data: Array<CurrentTermCourse> }) {
    return <DataTable columns={columns} data={data} />
}
