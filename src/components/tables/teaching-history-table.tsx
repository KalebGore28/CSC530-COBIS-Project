import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/tables/data-table"
import type { JSX } from "react"

type TeachingHistory = {
    term: string;
    total_courses: number;
    total_students: number;
    total_credit_hours: number;
    action: JSX.Element;
}

const columns: ColumnDef<TeachingHistory>[] = [
    {
        accessorKey: "term",
        header: "Term",
    },
    {
        accessorKey: "total_courses",
        header: "Total Courses",
    },
    {
        accessorKey: "total_students",
        header: "Total Students",
    },
    {
        accessorKey: "total_credit_hours",
        header: "Total Credit Hours",
    },
    {
        header: "Action",
        cell: ({ row }) => row.original.action, // render the JSX
    },
]

export function TeachingHistoryTable({ data }: { data: TeachingHistory[] }) {
    return <DataTable columns={columns} data={data} />
}