import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"

type Program = {
    id: string
    description: string
    level: string
    type: string
    year_term: string
}

const columns: ColumnDef<Program>[] = [
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "level",
        header: "Level",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "year_term",
        header: "Year/Term",
    }
]

export function ProgramTable({ data }: { data: Program[] }) {
    return <DataTable columns={columns} data={data} />
}