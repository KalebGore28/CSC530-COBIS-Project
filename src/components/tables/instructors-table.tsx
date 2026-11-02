import type { JSX } from "react";
import { DataTable } from "@/components/tables/data-table";
import type { DataTableColumnDef } from "@/components/tables/data-table";

type InstructorTableRow = {
  instructor: JSX.Element;
  mnumber: string;
  department: string;
  college: string;
  email: string;
};

const columns: Array<DataTableColumnDef<InstructorTableRow>> = [
  {
    header: "Instructor",
    cell: ({ row }) => row.original.instructor, // render the JSX
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "college",
    header: "College",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
];

export function InstructorsTable({
  data,
  onRowSelect,
}: {
  data: Array<InstructorTableRow>;
  onRowSelect?: (row: InstructorTableRow) => void;
}) {
  return <DataTable columns={columns} data={data} onRowSelect={onRowSelect} />;
}
