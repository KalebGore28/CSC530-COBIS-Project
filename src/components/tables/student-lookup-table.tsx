import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/tables/data-table"

export type StudentLookup = {
    mnumber: string;
    first_name: string;
    last_name: string;
    email: string;
}

const columns: ColumnDef<StudentLookup>[] = [
    {
        accessorKey: "mnumber",
        header: "MNumber",
    },
    {
        accessorKey: "first_name",
        header: "First Name",
    },
    {
        accessorKey: "last_name",
        header: "Last Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
]

export function StudentLookupTable({ data }: { data: StudentLookup[] }) {
    return <DataTable columns={columns} data={data} />
}