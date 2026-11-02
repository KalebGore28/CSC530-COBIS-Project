import { DataTable } from "@/components/tables/data-table";
import type { DataTableColumnDef } from "@/components/tables/data-table";

type Program = {
  id: string;
  description: string;
  level: string;
  type: string;
  year_term: string;
};

const columns: Array<DataTableColumnDef<Program>> = [
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
  },
];

export function ProgramTable({ data }: { data: Array<Program> }) {
  return <DataTable columns={columns} data={data} />;
}
