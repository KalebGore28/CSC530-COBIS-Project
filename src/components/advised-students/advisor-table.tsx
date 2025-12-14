import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'

type Advisor = {
    id: string
    mnumber: string
    name: string
    email: string
    year_term: string
}

const columns: Array<ColumnDef<Advisor>> = [
    {
        accessorKey: 'mnumber',
        header: 'MNumber',
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'year_term',
        header: 'Term',
    },
]

export function AdvisorTable({ data }: { data: Array<Advisor> }) {
    return <DataTable columns={columns} data={data} />
}
